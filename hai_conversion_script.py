from flask import Flask,request
from flask_cors import CORS
import os
import pandas as pd
app = Flask(__name__)
CORS(app)
import json
import re
import ast
from collections import defaultdict

# mapped rotation
def get_rotation(rotation):
	if rotation == '0':
		return 0
	if rotation == '90':
		return 3
	if rotation == '180':
		return 2
	if rotation == '270':
		return 1

# creating zone json
class CreateZoneJson:
	
	def get_zone_json(self, df):
		zone_df = df[~df['ZONE_ID'].isnull()]
		data = []
		if not zone_df.empty:
			zone_list = list(set(zone_df['ZONE_ID']))
			for zone_id in zone_list:
				zone_json = {
					"zonerec":
					{
						"zone_id": str(int(zone_id)),
						"blocked": False,
						"paused": False
					}
				}
				data.append(zone_json)
		zone_json = {"header":
			{
				"content-type": "application/json",
				"accept": "application/json"
			},
			"type": "POST",
			"data":data,
			"url": "/api/zonerec"
			}
		return zone_json

# creating pps json
class CreatePPSJson:
	def get_pps_json(self, df, matrix_cord):
		ppsList = []
		if 'PPS_STATION_ID' in df:
			df_pps = df[~df['PPS_STATION_ID'].isnull()]
			if not df_pps.empty:
				pps_mapping = df_pps.to_dict('records')
				for pps in pps_mapping:
					world_cordinate_location = (pps['Position X'],pps['Position Y'], pps['FLOOR'])
					pps_barcode,coordinate = findBarcodeFromLocation(world_cordinate_location,matrix_cord)
					pps_json = {
							"location": pps_barcode,
							"status": "disconnected",
							"queue_barcodes":
							[
							],
							"pick_position": pps_barcode,
							"pick_direction": int(get_rotation(str(pps['Rotation']))),
							"put_docking_positions":
							[],
							"allowed_modes":
							[
								"put",
								"pick",
								"audit"
							],
							"type": pps['PPS_TYPE'].lower(),
							"pps_id": int(pps['PPS_STATION_ID']),
							"pps_url": "http://localhost:8181/pps/1/api/"
					}
					ppsList.append(pps_json)
		return ppsList


# create map json
class CreateMap:
	
	def calculate_size_info(self, value1, value2):
		return abs(value1-value2)//2
	# get distance of two barcode
	def getSearchDistanceSoFar(self, worldx, worldy, n_worldx, n_worldy, direction):
		
		if direction == "north" or direction == "south":
			distance = abs(worldy - n_worldy)
		else:
			distance = abs(n_worldx - worldx)
		return distance
	# get distance of barcode of each tile
	def getDistance(self, worldx,worldy,n_worldx,n_worldy,direction):
		if direction == "north" or direction == "south":
			distance = self.calculate_size_info(worldy,n_worldy)
		else:
			distance = self.calculate_size_info(n_worldx,worldx)
		return distance
	# find neighbour existance
	def findNeighbourData(self,ncoord, direction, matrix_cord, allDict ,coord):
		l = [0,0,0]
		d = 750
		n_x , n_y = ncoord
		x , y = coord
		worldx,worldy,floor = matrix_cord[coord]

		if ncoord in matrix_cord:
			n_worldx,n_worldy,n_floor = matrix_cord[ncoord] 
			if matrix_cord[ncoord] in allDict:
				l = [1,1,1]
				d = self.getDistance(worldx,worldy,n_worldx,n_worldy,direction)
				if d > 1000:
					l = [0,0,0]
					d = 750
					ncoord = None
			else:
				distance = self.getSearchDistanceSoFar(worldx,worldy,n_worldx,n_worldy,direction)
				if distance > 2000:
					l = [0,0,0]
					d = 750
					ncoord = None
				else:
					if direction == "north":
						return self.findNeighbourData((x,n_y-1),"north",matrix_cord,allDict,coord)
					elif direction == "east":
						return self.findNeighbourData((n_x-1,y),"east",matrix_cord,allDict,coord)
					elif direction == "south":
						return self.findNeighbourData((x,n_y+1),"south",matrix_cord,allDict,coord)
					elif direction == "west":
						return self.findNeighbourData((n_x+1,y),"west",matrix_cord,allDict,coord)

		return l,d,ncoord
	# find size info
	def getNeighbourSizeInfo(self, x, y ,matrix_cord, allLocationCords):
		coord = (x,y)
		coordList = {(x,y-1):"north",(x-1,y):"east",(x,y+1):"south",(x+1,y):"west"}
		neighbourList = []
		sizeInfoList = []
		adjacencyList = []
		for ncoord,direction in coordList.items():
			neighbour,distance,adjacent = self.findNeighbourData(ncoord, direction, matrix_cord, allLocationCords , coord)
			neighbourList.append(neighbour)
			sizeInfoList.append(int(distance))
			adjacencyList.append(adjacent)
		return neighbourList, sizeInfoList, adjacencyList
	# create map json
	def create_map(self, matrix_cord, allLocationCords, location_cord_name_mapping, \
														floor_dict, sector_mapping):
		mapValueDict = {}
		mapValueList = []
		MapList = []
		for grid_cord,loc_cord in matrix_cord.items():
			if loc_cord in allLocationCords:
				get_storable = list(filter(lambda x: 'storage' in x.lower(), location_cord_name_mapping[loc_cord]))
				rtype = 's' if len(get_storable)>0 else 'p'
				# sector_id = 0
				sector_id = [x for x in sector_mapping[loc_cord] if pd.isnull(x) == False]
				if len(sector_id)<1:
					sector_id = "undefined"
				else:
					sector_id = int(sector_id[0])
				xloc,yloc,rtype,xcoords, ycoords = loc_cord[0],loc_cord[1],rtype,grid_cord[0],grid_cord[1]
				barcode = "%03d.%03d"%(ycoords,xcoords)
				neighbours,size_info,adjacency_list = self.getNeighbourSizeInfo(xcoords,ycoords,matrix_cord,allLocationCords)
				if rtype =="p":
					store_status = 0
				elif rtype =="s":
					store_status = 1
				mapValueDict = { 
					"barcode": barcode,
					"blocked": False,
					"botid": "null",
					"coordinate": "[%d,%d]"%(xcoords,ycoords),
					"neighbours": neighbours,
					"size_info": size_info,
					"store_status": store_status,
					"zone": "defzone",
					"floor_id" : int(floor_dict[grid_cord]),
					"sector": sector_id,
					"adjacency":adjacency_list
				}
				if len(mapValueDict.keys())>0:
					mapValueList.append(mapValueDict)
		# create normalized map
		MapList = NormalizedDenormalizedMap().getNormalizedMap(mapValueList)
		return MapList,mapValueList


# create charger json
class CreateChargerJson:

	def getChargerLocation(self, charger_dict, matrix_cord):
		world_cord = (charger_dict['Position X'],charger_dict['Position Y'],charger_dict['FLOOR'])
		charger_barcode,coordinate = findBarcodeFromLocation(world_cord,matrix_cord)
		return charger_barcode,coordinate

	def getChargerEntryPoint(self, charger_dict, matrix_cord):
		world_cord = tuple(json.loads(charger_dict['CHARGER_ENTRY_POINT']))
		entrypoint_barcode,coordinate = findBarcodeFromLocation(world_cord+(charger_dict['FLOOR'],),matrix_cord)
		return entrypoint_barcode,coordinate

	def get_charger_json(self, df, matrix_cord):
		chargerJson = {}
		chargerList = []
		coordinate_dict = {}
		reinit_dict = {}
		if 'CHARGER_ID' in df: 
			df_charger = df[~df['CHARGER_ID'].isnull()]
			if not df_charger.empty:
				mapping_charger = df_charger.to_dict('records')
				for charger_dict in mapping_charger:
					charger_location,coordinate = self.getChargerLocation(charger_dict,matrix_cord)
					charger_entrypoint,reinit_cordinate = self.getChargerEntryPoint(charger_dict,matrix_cord)
					rotation = int(get_rotation(str(charger_dict['Rotation'])))
					chargerJson = {
								"charger_location": charger_location,
								"charger_direction": rotation,
								"entry_point_location": charger_entrypoint,
								"entry_point_direction": rotation,
								"reinit_point_location": charger_entrypoint,
								"reinit_point_direction": rotation,
								"status": "disconnected",
								"mode": "manual",
								"charger_type": charger_dict['CHARGER_TYPE'].lower().replace(' ','_'),
								"charger_id": int(charger_dict['CHARGER_ID'])
							}
					chargerList.append(chargerJson)
					coordinate_dict[coordinate]=[rotation,reinit_cordinate]

		return chargerList,coordinate_dict

# create sector json
def createSectorJson(df, matrix_cord, allLocationCords,sector_mapping):
	sector_dict = defaultdict(list)
	for coord,loc in matrix_cord.items():
		if matrix_cord[coord] in allLocationCords:
			sector_id = [x for x in sector_mapping[loc] if pd.isnull(x) == False]
			if len(sector_id)<1:
				sector_id = "undefined"
			else:
				sector_id = int(sector_id[0])
			sector_dict[str(sector_id)].append("[{},{}]".format(coord[0],coord[1]))
	sector_json = [sector_dict]
	return sector_json

# find barcode on location
def findBarcodeFromLocation(world_cordinate_location,matrix_cord):
	location = ''
	matrix_cord_key = list(matrix_cord.keys())
	matrix_cord_value = list(matrix_cord.values())
	new_pos = matrix_cord_value.index(world_cordinate_location)
	coordinate = matrix_cord_key[new_pos]
	barcode = "%03d.%03d"%(coordinate[1],coordinate[0])
	return barcode,coordinate

# create ods file
class CreateOdsJson:
	
	def get_ods_json(self, df, matrix_cord):
		ods_list = []
		if 'ODS_EXCLUDED' in df:
			ods_exclude = df[~df['ODS_EXCLUDED'].isnull()]
			ods_mapping = ods_exclude.to_dict('records')
			for ods in ods_mapping:
				world_cordinate_location = (ods['Position X'],ods['Position Y'],ods['FLOOR'])
				ods_value = (ods["ODS_EXCLUDED"].replace('[','').replace(']','')).split(",")
				for i,v in enumerate(ods_value):
					if v:
						pps_barcode,coordinate = findBarcodeFromLocation(world_cordinate_location,matrix_cord)
						ods_json = {
							"excluded": True,
							"ods_tuple": "{}--{}".format(pps_barcode,i)
						}
						ods_list.append(ods_json)
		
		odsJson = {"ods_excluded_list":ods_list}
		return odsJson


# find directionality of charger json
class CreateChargerDirectionality:

	def getAdjcencyCord(self, get_reinit_neighbour, barcodesDict):
		adjacency_list = []
		all_cords = list(barcodesDict.keys())
		for item in get_reinit_neighbour:
			if item in all_cords:
				adjacency_list.append(list(item))
			else:
				adjacency_list.append(None)
		return adjacency_list

	def get_charger_directionality(self, charger_cordinate, mapValueList):

		barcodesDict = NormalizedDenormalizedMap().convertDenormalize(mapValueList)
		for charger_coord,reinit in charger_cordinate.items():
			direction = reinit[0]
			reinit = reinit[1]
			x,y = charger_coord
			r_x,r_y = reinit
			reinit_barcode_dict = barcodesDict[reinit]
			get_reinit_neighbour = barcodesDict[reinit]['adjacency']
			reinit_barcode_dict['neighbours'][direction] = [1, 1, 0]
			reinit_barcode_dict['neighbours'][(direction + 2) % 4] = [1, 1, 0]
			get_adjecency_coord = self.getAdjcencyCord(get_reinit_neighbour,barcodesDict)
			reinit_barcode_dict['adjacency'] = get_adjecency_coord

			get_charger_neighbour = barcodesDict[charger_coord]['adjacency']
			charger_barcode_dict = barcodesDict[charger_coord]
			charger_barcode_dict['neighbours'][direction][2] = 0
			for index,item in enumerate(get_charger_neighbour):
				if index != direction:
					charger_barcode_dict['neighbours'][index][1] = 0
					charger_barcode_dict['neighbours'][index][2] = 0
			get_charger_adjecency_coord = self.getAdjcencyCord(get_charger_neighbour,barcodesDict)
			charger_barcode_dict['adjacency'] = get_charger_adjecency_coord

			e_x,e_y = get_reinit_neighbour[direction]
			get_entry_barcode_dict = barcodesDict[get_reinit_neighbour[direction]]
			get_entry_barcode_dict['neighbours'][(direction + 2) % 4][2] = 0
			get_entry_neighbour = [(e_x,e_y-1),(e_x-1,e_y),(e_x,e_y+1),(e_x+1,e_y)]
			get_entry_barcode_coord = self.getAdjcencyCord(get_entry_neighbour,barcodesDict)
			get_entry_barcode_dict['adjacency'] = get_entry_barcode_coord


			for index,item in enumerate(get_charger_neighbour):
				if item != reinit and item in list(barcodesDict.keys()):
					barcodesDict[item]['neighbours'][(index + 2) % 4][1] = 0
					barcodesDict[item]['neighbours'][(index + 2) % 4][2] = 0
		
		data = NormalizedDenormalizedMap().getNormalizedMap(list(barcodesDict.values()))
		mapValueList = 	list(barcodesDict.values())	
		return mapValueList,data

# get fence distance on map json
class CreateFenceDistance:
	def get_fence_distance(self, df, mapValueList, matrix_cord):
		data = NormalizedDenormalizedMap().convertDenormalize(mapValueList)
		if 'FENCE_DISTANCE' in df:
			df_fence_distance = df[~df['FENCE_DISTANCE'].isnull()]
			fence_distance = df_fence_distance.to_dict('records')
			for fence in fence_distance:
				world_cordinate_location = (fence['Position X'],fence['Position Y'],fence['FLOOR'])
				pps_barcode,coordinate = findBarcodeFromLocation(world_cordinate_location,matrix_cord)
				fence_value = (fence["FENCE_DISTANCE"].replace('[','').replace(']','')).split(",")
				for index,value in enumerate(fence_value):
					if value:
						data[coordinate]['size_info'][index] = int(value)
		map_data = NormalizedDenormalizedMap().getNormalizedMap(list(data.values()))
		mapValueList = 	list(data.values())	
		return map_data,mapValueList

# create elevator json and update barcode on map json
class CreateElevatorJson:
	def get_elevator_json(self, df, matrix_cord):
		elevator_list = []
		mapping_elevator_barcode = {}
		if 'ELEVATOR_ID' in df:
			df = df[~df['ELEVATOR_ID'].isnull()]
			if not df.empty:
				df = df.sort_values('FLOOR').groupby('ELEVATOR_ID')[('Position X','Position Y','ENTRY_BARCODE','EXIT_BARCODE','FLOOR','Rotation','ELEVATOR_TYPE')].apply(lambda g: list(map(tuple, g.values.tolist()))).to_dict()
				for elevator_id,elevator_row in df.items():
					entry_barcode_list = []
					exit_barcode_list = []
					coord_list = []
					edit_coord_for_mapping = []
					for elevator_data in elevator_row:
						barcode,coordinate = findBarcodeFromLocation((elevator_data[0],elevator_data[1],elevator_data[4]),matrix_cord)
						entry_barcode,entry_coord = findBarcodeFromLocation(tuple(json.loads(elevator_data[2]))+(elevator_data[4],),matrix_cord)
						exit_barcode,exit_coord = findBarcodeFromLocation(tuple(json.loads(elevator_data[3]))+(elevator_data[4],),matrix_cord)
						entry_barcode_dict = {
												"barcode": entry_barcode,
												"boom_barrier_id": 1,
												"floor_id": elevator_data[4]
											}
						exit_barcode_dict = {
												"barcode": exit_barcode,
												"boom_barrier_id": 1,
												"floor_id": elevator_data[4]
											}
						coord_dict = {
										"coordinate": list(coordinate),
										"direction": int(get_rotation(str(elevator_data[5])))
									}
						entry_barcode_list.append(entry_barcode_dict)
						exit_barcode_list.append(exit_barcode_dict)
						coord_list.append(coord_dict)
						edit_coord_for_mapping.append(coordinate)
					first_floor_position,first_floor_coordinate = findBarcodeFromLocation((elevator_row[0][0],elevator_row[0][1],elevator_row[0][4]),matrix_cord)
					elevator_dict = {
										"elevator_id": int(elevator_id),
										"position": first_floor_position,
										"type": "_".join(elevator_row[0][-1].lower().split()),
										"entry_barcodes": entry_barcode_list,
										"reinit_barcodes": [],
										"exit_barcodes": exit_barcode_list,
										"coordinate_list": coord_list
									}
					elevator_list.append(elevator_dict)
					mapping_elevator_barcode[first_floor_coordinate] = edit_coord_for_mapping
		
		return elevator_list,mapping_elevator_barcode
	
	def update_elevator_barcode(self, mapping_elevator_barcode, mapValueList):
		barcodesDict = NormalizedDenormalizedMap().convertDenormalize(mapValueList)
		for k,v in mapping_elevator_barcode.items():
			barcode = "%03d.%03d"%(k[1],k[0])
			for data in v:
				barcodesDict[data]['barcode'] = barcode
		data = NormalizedDenormalizedMap().getNormalizedMap(list(barcodesDict.values()))
		mapValueList = 	list(barcodesDict.values())	
		return mapValueList,data

# create normalise and denormalised map value data
class NormalizedDenormalizedMap:
	
	def convertDenormalize(self, data):
		denomalize_dict = {}
		for item in data:
			coord = tuple(ast.literal_eval(item['coordinate']))
			denomalize_dict[coord] = item
		return denomalize_dict
	
	def getNormalizedMap(self, mapValueList):
		mapList = defaultdict(list)
		for item in mapValueList:
			map_value_dict = {
					"barcode": item["barcode"],
					"blocked": item["blocked"],
					"botid": item["botid"],
					"coordinate": item["coordinate"],
					"neighbours": item["neighbours"],
					"size_info": item["size_info"],
					"store_status": item["store_status"],
					"zone": item["zone"],
					"adjacency":item["adjacency"],
					"sector":item["sector"]
					}
			mapList[item["floor_id"]].append(map_value_dict)
		map_parsed_list = [{"floor_id":k, "map_values":v} for k,v in mapList.items()]
		return map_parsed_list

# create matrix of autocad file
class GetAndCreateMapMatrix:
	
	def create_matrix(self, x_loc, y_loc, x_loc_index, \
									y_loc_index, CoordDict, floor_dict, floor):
		for y_index,y_val in enumerate(y_loc):
			for x_index,x_val in enumerate(x_loc):
				GridCoord =  (x_loc_index+x_index+1, y_loc_index+y_index+1)
				CoordDict[GridCoord] = (x_val, y_val, floor)
				floor_dict[GridCoord] = floor
		return CoordDict,floor_dict
	
	def getMapMatrix(self,df):
		get_floor_id = sorted(df['FLOOR'].dropna().unique())
		x_loc_dict = df.groupby('FLOOR')['Position X'].apply(list).to_dict()
		y_loc_dict = df.groupby('FLOOR')['Position Y'].apply(list).to_dict()
		floor_dict = {}
		start_index_x = 0
		start_index_y = 0
		CoordDict = {}
		for floor in get_floor_id:

			x_loc = sorted(set(x_loc_dict[floor]),reverse=True)
			y_loc = sorted(set(y_loc_dict[floor]),reverse=True)

			matrix_cord,floor_dict = self.create_matrix(x_loc, y_loc, \
				start_index_y, start_index_x, CoordDict, floor_dict, floor)
			start_index_x = int(list(matrix_cord.keys())[-1][0]) + 100
			start_index_y = int(list(matrix_cord.keys())[-1][0]) + 100
		return CoordDict, floor_dict

# validation
class ValidationAutocad:
	def validate_schema(self, df):
		# mandatory column names
		column_name = ['Name', 'Position X', 'Position Y', 'ZONE_ID', 'Rotation', 'FLOOR']
		dataframe_col_headers = list(df.columns.values)
		diff_list = list(set(column_name) - set(dataframe_col_headers))
		if diff_list:
			return False,f"This column name {diff_list} is not mapped"
		return True,''
	
	def validate_pps_type(self,df):
		pps_type_mapping_list = ["ppp_manual", "ara", "manual"]
		if 'PPS_TYPE' in df:
			get_pps_type = sorted(df['PPS_TYPE'].str.lower().dropna().unique())
			pps_type_diff = list(filter(lambda a: a not in pps_type_mapping_list, get_pps_type))
			if pps_type_diff:
				return False,f"Map creator not support {pps_type_diff} pps_type"
			return True,""
		else:
			return True,""

	def validate_duplicate_location(self,df):
		duplicateRowsDF = df[df.duplicated(['Name', 'Position X', 'Position Y'])]
		duplicate_list = duplicateRowsDF[['Name', 'Position X', 'Position Y']].values.tolist()
		if duplicate_list:
			return False,f"Duplicate Barcode exist --> {duplicate_list}"
		return True,''

	def validate_entity(self,df):
		not_duplicate_entity_list = []
		entity = ['charger', 'pick put station', 'elevator', 'storage']  
		entity_df = df[df['Name'].str.lower().str.contains('|'.join(entity))]
		duplicateRowsDF = df[df.duplicated(['Position X', 'Position Y'])]
		entity_df_list = entity_df[['Position X', 'Position Y']].values.tolist()
		duplicate_df_list = duplicateRowsDF[['Position X', 'Position Y']].values.tolist()
		entity_type_diff = list(filter(lambda a: a not in duplicate_df_list, entity_df_list))
		if entity_type_diff:
			return False,f"Following Entity should have barcode associated --> {entity_type_diff}"
		return True,''

	def validate_floor_exist(self,df):
		floor_empty_df = df[df['FLOOR'].isna()]
		floor_empty_df = floor_empty_df[['Name','Position X', 'Position Y','FLOOR']].values.tolist()
		if floor_empty_df:
			return False,f"Please mention floor_id on barcode --> ->{floor_empty_df}"
		return True,''

	def validate_charger_entry_point_location(self,df):
		if 'CHARGER_ENTRY_POINT' in df:
			barcode_df = df[df['Name'].str.lower().str.contains('barcode')]
			charger_df = df[df['Name'].str.lower().str.contains('charger')]
			barcode_list = barcode_df[['Position X', 'Position Y']].values.tolist()
			charger_list = charger_df.CHARGER_ENTRY_POINT.apply(ast.literal_eval).tolist()
			diff_list = list(filter(lambda a: a not in barcode_list, charger_list))
			if diff_list:
				return False,f"Following Charger Entry point does not exist --> {diff_list}"
			return True,''
		else:
			return True,''

	def validate_unique_pps_id(self,df):
		if 'PPS_STATION_ID' in df:
			duplicatePpsIdRowsDF = df[df.duplicated(['PPS_STATION_ID']) & ~df['PPS_STATION_ID'].isna()]
			duplicate_pps_list = duplicatePpsIdRowsDF[['PPS_STATION_ID']].values.tolist()
			if duplicate_pps_list:
				return False,f"Duplicate pps id exist --> {duplicate_pps_list}"
			return True,''
		else:
			return True,''

	def validate_unique_elevator_id(self,df):
		if 'ELEVATOR_ID' in df:
			duplicateElevatorIdRowsDF = df[df.duplicated(['ELEVATOR_ID']) & ~df['ELEVATOR_ID'].isna()]
			duplicate_elevator_list = duplicateElevatorIdRowsDF[['ELEVATOR_ID']].values.tolist()
			if duplicate_elevator_list:
				return False,f"Duplicate elevator id exist --> {duplicate_elevator_list}"
			return True,''
		else:
			return True,''

	def validate_unique_charger_id(self,df):
		if 'CHARGER_ID' in df:
			duplicateChargerIdRowsDF = df[df.duplicated(['CHARGER_ID']) & ~df['CHARGER_ID'].isna()]
			duplicate_charger_list = duplicateChargerIdRowsDF[['CHARGER_ID']].values.tolist()
			if duplicate_charger_list:
				return False,f"Duplicate charger id exist --> {duplicate_charger_list}"
			return True,''
		else:
			return True,''

	def validation(self,df):
		error_list = []
		try:
			scheme_valitation,error =  self.validate_schema(df)
			if not scheme_valitation:
				return error,404
		except Exception as e:
			return repr(e),404

		try:
			entity_valitation,error =  self.validate_entity(df)
			if not entity_valitation:
				error_list.append(error)
		except Exception as e:
			return repr(e),404

		try:
			duplicate_location_valitation,error =  self.validate_duplicate_location(df)
			if not duplicate_location_valitation:
				error_list.append(error)
		except Exception as e:
			return repr(e),404

		try:
			charger_location_valitation,error =  self.validate_charger_entry_point_location(df)
			if not charger_location_valitation:
				error_list.append(error)
		except Exception as e:
			return repr(e),404

		try:
			floor_exist_valitation,error =  self.validate_floor_exist(df)
			if not floor_exist_valitation:
				error_list.append(error)
		except Exception as e:
			return repr(e),404

		try:
			pps_type_valitation,error =  self.validate_pps_type(df)
			if not pps_type_valitation:
				error_list.append(error)
		except Exception as e:
			return repr(e),404
		
		try:
			validate_unique_pps_id,error =  self.validate_unique_pps_id(df)
			if not validate_unique_pps_id:
				error_list.append(error)
		except Exception as e:
			return repr(e),404

		try:
			validate_unique_elevator_id,error =  self.validate_unique_elevator_id(df)
			if not validate_unique_elevator_id:
				error_list.append(error)
		except Exception as e:
			return repr(e),404

		try:
			validate_unique_charger_id,error =  self.validate_unique_charger_id(df)
			if not validate_unique_charger_id:
				error_list.append(error)
		except Exception as e:
			return repr(e),404

		if error_list:
			return error_list,404

		return error,''


@app.route('/data',methods=['GET', 'POST'])
def my_link():
	req_file = request.files
	df = pd.read_excel(req_file["arrFile"])
	error,status = ValidationAutocad().validation(df)
	if error:
		return {"content":error,"status":status}
	try:
		# Create matrix coordinate for autocad csv file
		matrix_cord, floor_dict = GetAndCreateMapMatrix().getMapMatrix(df)
	except Exception as e:
		return {"content":"Error in parsing autocad file --> Matrix coordination","status":404}
	
	# Location coordinate and name mapping "(x,y):'name'}
	location_cord_name_mapping = df.groupby(['Position X','Position Y','FLOOR'])['Name'].apply(list).to_dict()
	
	# list of all location coordinate [(x1,y1),(x2,y2)]
	allLocationCords = list(df[['Position X', 'Position Y','FLOOR']].apply(tuple, axis=1))
	
	sector_mapping = df.groupby(['Position X','Position Y','FLOOR'])['SECTOR_ID'].apply(list).to_dict()
	
	try:
		# Create map json and get map value list for denomalised map
		data,mapValueList = CreateMap().create_map(matrix_cord,allLocationCords,\
											location_cord_name_mapping,floor_dict,\
											sector_mapping)
	except Exception as e:
		return {"content":"Error in parsing autocad file --> Map Json","status":404}
	
	try:
		# Forming ods json
		ods_json = CreateOdsJson().get_ods_json(df, matrix_cord)
	except Exception as e:
		return {"content":"Error in parsing autocad file --> ODS Json","status":404}
	
	try:
		pps_json = CreatePPSJson().get_pps_json(df, matrix_cord)
	except Exception as e:
		return {"content":"Error in parsing autocad file --> PPS Json","status":404}

	try:
		zone_json = CreateZoneJson().get_zone_json(df)
	except Exception as e:
		return {"content":"Error in parsing autocad file --> Zone Json","status":404}

	try:
		SectorJson = createSectorJson(df,matrix_cord,allLocationCords,sector_mapping)
	except Exception as e:
		return {"content":"Error in parsing autocad file --> Sector Json","status":404}
	
	try:
		charger_json,charger_cordinate = CreateChargerJson().get_charger_json(df, matrix_cord)
	except Exception as e:
		return {"content":repr(e),"status":404}

	try:
		mapValueList,data = CreateChargerDirectionality().get_charger_directionality(charger_cordinate, mapValueList)
	except Exception as e:
		return {"content":"Error in parsing autocad file --> Charger Json","status":404}
	
	try:
		data,mapValueList = CreateFenceDistance().get_fence_distance(df, mapValueList, matrix_cord)
	except Exception as e:
		return {"content":"Error in parsing autocad file --> Fense Distance","status":404}

	try:
		elevator_json,mapping_elevator_barcode = CreateElevatorJson().get_elevator_json(df, matrix_cord)
	except Exception as e:
		return {"content":"Error in parsing autocad file --> Elevator Json","status":404}

	try:
		mapValueList,data = CreateElevatorJson().update_elevator_barcode(mapping_elevator_barcode, mapValueList)
	except Exception as e:
		return {"content":"Error in parsing autocad file --> Elevator Json","status":404}

	return {"content":{'mapJson':data , 'odsExcludedJson':ods_json , 'ppsJson':pps_json, 'zoneJson': zone_json, 'chargerJson':charger_json, 'elevatorJson':elevator_json},"status":200}


if __name__ == '__main__':
	app.run(host='0.0.0.0', port=3000)