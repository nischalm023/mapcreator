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



def get_rotation(rotation):
	if rotation == '0':
		return 0
	if rotation == '90':
		return 1
	if rotation == '180':
		return 2
	if rotation == '270':
		return 3

class CreateZoneJson:
	
	def get_zone_json(self, df):
		zone_df = df[~df['ZONE_ID'].isnull()]
		zone_list = list(set(zone_df['ZONE_ID']))
		data = []
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
		data = json.dumps(zone_json)
		with open("zone_mahimaaa.json","w") as f:
			f.write(data)
		return zone_json

class CreatePPSJson:
	def get_pps_json(self, df, matrix_cord):
		df_pps = df[~df['PPS_STATION_ID'].isnull()]
		pps_mapping = df_pps.to_dict('records')
		ppsList = []
		for pps in pps_mapping:
			world_cordinate_location = (pps['Position X'],pps['Position Y'])
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

class CreateMap:
	
	def calculate_size_info(self, value1, value2):
		return abs(value1-value2)//2
	
	def getSearchDistanceSoFar(self, worldx, worldy, n_worldx, n_worldy, direction):
		
		if direction == "north" or direction == "south":
			distance = abs(worldy - n_worldy)
		else:
			distance = abs(n_worldx - worldx)
		return distance

	def getDistance(self, worldx,worldy,n_worldx,n_worldy,direction):
		if direction == "north" or direction == "south":
			distance = self.calculate_size_info(worldy,n_worldy)
		else:
			distance = self.calculate_size_info(n_worldx,worldx)
		return distance

	def findNeighbourData(self,ncoord, direction, matrix_cord, allDict ,coord):
		l = [0,0,0]
		d = 750
		n_x , n_y = ncoord
		x , y = coord
		worldx,worldy = matrix_cord[coord]

		if ncoord in matrix_cord:
			n_worldx,n_worldy = matrix_cord[ncoord] 
			if matrix_cord[ncoord] in allDict:
				l = [1,1,1]
				d = self.getDistance(worldx,worldy,n_worldx,n_worldy,direction)
			else:
				distance = self.getSearchDistanceSoFar(worldx,worldy,n_worldx,n_worldy,direction)
				if distance > 1800:
					l = [0,0,0]
					d = 750
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

	def create_map(self, matrix_cord, allLocationCords, location_cord_name_mapping, \
														floor_dict, sector_mapping):
		mapValueDict = {}
		mapValueList = []
		MapList = []
		for grid_cord,loc_cord in matrix_cord.items():
			if loc_cord in allLocationCords:
				rtype = 's' if "storage" in location_cord_name_mapping[loc_cord][0].lower() else "p"
				sector_id = [x for x in sector_mapping[loc_cord] if pd.isnull(x) == False][0]
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
					"sector":int(sector_id),
					"adjacency":adjacency_list
				}
				if len(mapValueDict.keys())>0:
					mapValueList.append(mapValueDict)

		MapList = NormalizedDenormalizedMap().getNormalizedMap(mapValueList)
		return MapList,mapValueList



class CreateChargerJson:

	def getChargerLocation(self, charger_dict, matrix_cord):
		world_cord = (charger_dict['Position X'],charger_dict['Position Y'])
		charger_barcode,coordinate = findBarcodeFromLocation(world_cord,matrix_cord)
		return charger_barcode,coordinate

	def getChargerEntryPoint(self, charger_dict, matrix_cord):
		world_cord = tuple(json.loads(charger_dict['CHARGER_ENTRY_POINT']))
		entrypoint_barcode,coordinate = findBarcodeFromLocation(world_cord,matrix_cord)
		return entrypoint_barcode,coordinate

	def get_charger_json(self, df, matrix_cord):
		chargerJson = {}
		chargerList = []
		coordinate_dict = {}
		reinit_dict = {} 
		df_charger = df[~df['CHARGER_ID'].isnull()]
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


def createSectorJson(df, matrix_cord, allLocationCords,sector_mapping):
	sector_dict = defaultdict(list)
	for coord,loc in matrix_cord.items():
		if matrix_cord[coord] in allLocationCords:
			sector_id = [x for x in sector_mapping[loc] if pd.isnull(x) == False][0]
			sector_dict[int(sector_id)].append("[{},{}]".format(coord[0],coord[1]))
	sector_json = [sector_dict]
	return sector_json
	
def findBarcodeFromLocation(world_cordinate_location,matrix_cord):
	location = ''
	matrix_cord_key = list(matrix_cord.keys())
	matrix_cord_value = list(matrix_cord.values())

	new_pos = matrix_cord_value.index(world_cordinate_location)
	coordinate = matrix_cord_key[new_pos]
	barcode = "%03d.%03d"%(coordinate[1],coordinate[0])
	return barcode,coordinate

class CreateOdsJson:
	
	def get_ods_json(self, df, matrix_cord):
		ods_exclude = df[~df['ODS_EXCLUDED'].isnull()]
		ods_mapping = ods_exclude.to_dict('records')
		ods_list = []
		for ods in ods_mapping:
			world_cordinate_location = (ods['Position X'],ods['Position Y'])
			ods_value = (ods["ODS_EXCLUDED"].replace('[','').replace(']','')).split(",")
			for i,v in enumerate(ods_value):
				if v:
					pps_barcode,coordinate = findBarcodeFromLocation(world_cordinate_location,matrix_cord)
					ods_json = {
						"excluded": True,
						"ods_tuple": "{}--{}".format(pps_barcode,i)
					}
					ods_list.append(ods_json)
		odsJson = {
		"ods_excluded_list":ods_list
		}
		return odsJson



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

class CreateFenceDistance:
	def get_fence_distance(self, df, mapValueList, matrix_cord):
		data = NormalizedDenormalizedMap().convertDenormalize(mapValueList)
		df_fence_distance = df[~df['FENCE_DISTANCE'].isnull()]
		fence_distance = df_fence_distance.to_dict('records')
		for fence in fence_distance:
			world_cordinate_location = (fence['Position X'],fence['Position Y'])
			pps_barcode,coordinate = findBarcodeFromLocation(world_cordinate_location,matrix_cord)
			fence_value = (fence["FENCE_DISTANCE"].replace('[','').replace(']','')).split(",")
			for index,value in enumerate(fence_value):
				if value:
					data[coordinate]['size_info'][index] = int(value)
		map_data = NormalizedDenormalizedMap().getNormalizedMap(list(data.values()))
		return map_data

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

class GetAndCreateMapMatrix:
	
	def create_matrix(self, x_loc, y_loc, x_loc_index, \
									y_loc_index, CoordDict, floor_dict, floor):
		for y_index,y_val in enumerate(y_loc):
			for x_index,x_val in enumerate(x_loc):
				GridCoord =  (x_loc_index+x_index+1, y_loc_index+y_index+1)
				CoordDict[GridCoord] = (x_val, y_val)
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

@app.route('/data',methods=['GET', 'POST'])
def my_link():
	req_file = request.files
	df = pd.read_excel(req_file["arrFile"])
	try:
		# Create matrix coordinate for autocad csv file
		matrix_cord, floor_dict = GetAndCreateMapMatrix().getMapMatrix(df)
	
	except Exception as e:
		return "Error in creating Matrix coordinate of autocad csv",404
	
	# Location coordinate and name mapping "(x,y):'name'}
	location_cord_name_mapping = df.groupby(['Position X','Position Y'])['Name'].apply(list).to_dict()
	
	# list of all location coordinate [(x1,y1),(x2,y2)]
	allLocationCords = list(df[['Position X', 'Position Y']].apply(tuple, axis=1))
	
	sector_mapping = df.groupby(['Position X','Position Y'])['SECTOR_ID'].apply(list).to_dict()
	
	try:
		# Create map json and get map value list for denomalised map
		data,mapValueList = CreateMap().create_map(matrix_cord,allLocationCords,\
											location_cord_name_mapping,floor_dict,\
											sector_mapping)
	except Exception as e:
		return "Error in Forming map json of autocad csv",404
	
	try:
		# Forming ods json
		ods_json = CreateOdsJson().get_ods_json(df, matrix_cord)
	except Exception as e:
		return "Error in Forming ods json of autocad csv",404
	
	try:
		pps_json = CreatePPSJson().get_pps_json(df, matrix_cord)
	except Exception as e:
		return "Error in Forming pps json of autocad csv",404

	try:
		zone_json = CreateZoneJson().get_zone_json(df)
	except Exception as e:
		return "Error in Forming zone json of autocad csv",404

	try:
		SectorJson = createSectorJson(df,matrix_cord,allLocationCords,sector_mapping)
	except Exception as e:
		return "Error in Forming sector json of autocad csv",404
	
	try:
		charger_json,charger_cordinate = CreateChargerJson().get_charger_json(df, matrix_cord)
	except Exception as e:
		return repr(e),404

	try:
		mapValueList,data = CreateChargerDirectionality().get_charger_directionality(charger_cordinate, mapValueList)
	except Exception as e:
		return "Error in Forming charger directionality of autocad csv",404
	
	try:
		data = CreateFenceDistance().get_fence_distance(df, mapValueList, matrix_cord)
	except Exception as e:
		return "Error in Forming fence distance of autocad csv",404

	return {'mapJson':data , 'odsExcludedJson':ods_json , 'ppsJson':pps_json, 'zoneJson': zone_json, 'chargerJson':charger_json}


if __name__ == '__main__':
	app.run('10.11.4.14', port=5000)