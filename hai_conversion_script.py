from flask import Flask,request
from flask_cors import CORS
import os
import pandas as pd
app = Flask(__name__)
CORS(app)
import json
import re
import ast

def create_matrix(x_loc,y_loc):
	CoordDict = {}
	for y_index,y_val in enumerate(y_loc):
		for x_index,x_val in enumerate(x_loc):
			GridCoord =  (x_index+1, y_index+1)
			CoordDict[GridCoord] = (x_val, y_val)
	return CoordDict

def get_rotation(rotation):
	if rotation == '0':
		return 0
	if rotation == '90':
		return 1
	if rotation == '180':
		return 2
	if rotation == '360':
		return 3

def createZoneJson(zone_list):
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

	# data = json.dumps(zone_json)
	# with open("zone_mahima1.json","w") as f:
	# 	f.write(data)
	return zone_json

def createPpsJson(pps_mapping,matrix_cord):
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


def getSearchDistanceSoFar(worldx,worldy,n_worldx,n_worldy,direction):
	if direction == "north":
		direction = abs(worldy - n_worldy)
	elif direction == "east":
		direction = abs(worldx - n_worldx)
	elif direction == "south":
		direction = abs(n_worldy - worldy)
	elif direction == "west":
		direction = abs(n_worldx - worldx)
	return direction

def getDistance(worldx,worldy,n_worldx,n_worldy,direction):
	if direction == "north":
		d = calculate_size_info(worldy,n_worldy)
	elif direction == "east":
		d = calculate_size_info(worldx,n_worldx)
	elif direction == "south":
		d = calculate_size_info(n_worldy,worldy)
	elif direction == "west":
		d = calculate_size_info(n_worldx,worldx)
	return d

def findNeighbourData(ncoord, direction, matrix_cord, allDict ,coord):
	l = [0,0,0]
	d = 750
	n_x , n_y = ncoord
	x , y = coord
	worldx,worldy = matrix_cord[coord]

	if ncoord in matrix_cord:
		n_worldx,n_worldy = matrix_cord[ncoord] 
		if matrix_cord[ncoord] in allDict:
			l = [1,1,1]
			d = getDistance(worldx,worldy,n_worldx,n_worldy,direction)
		else:
			distance = getSearchDistanceSoFar(worldx,worldy,n_worldx,n_worldy,direction)
			if distance > 1900:
				l = [0,0,0]
				d = 750
			else:
				if direction == "north":
					return findNeighbourData((x,n_y-1),"north",matrix_cord,allDict,coord)
				elif direction == "east":
					return findNeighbourData((n_x-1,y),"east",matrix_cord,allDict,coord)
				elif direction == "south":
					return findNeighbourData((x,n_y+1),"south",matrix_cord,allDict,coord)
				elif direction == "west":
					return findNeighbourData((n_x+1,y),"west",matrix_cord,allDict,coord)

	return l,d
		
				
def getNeighbourSizeInfo(x, y ,matrix_cord, allCords):
	coord = (x,y)
	coordList = {(x,y-1):"north",(x-1,y):"east",(x,y+1):"south",(x+1,y):"west"}
	neighbourList = []
	sizeInfoList = []
	for ncoord,direction in coordList.items():
		neighbour,distance = findNeighbourData(ncoord, direction, matrix_cord, allCords , coord)
		neighbourList.append(neighbour)
		sizeInfoList.append(int(distance))
	return neighbourList, sizeInfoList

def calculate_size_info(value1, value2):
	return abs(value1-value2)//2

def create_map(matrix_cord,allCords,matric_cord_name_mapping):
	myDict = {}
	mainList = []
	count = 0
	for grid_cord,loc_cord in matrix_cord.items():
		if loc_cord in allCords:
			rtype = 's' if "storage" in matric_cord_name_mapping[loc_cord][0].lower() else "p"
			xloc,yloc,rtype,xcoords, ycoords = loc_cord[0],loc_cord[1],rtype,grid_cord[0],grid_cord[1]
			barcode = "%03d.%03d"%(ycoords,xcoords)
			neighbours,size_info = getNeighbourSizeInfo(xcoords,ycoords,matrix_cord,allCords)
			myDict = {"neighbours": neighbours}
			if rtype =="p":
				store_status = 0
			elif rtype =="s":
				store_status = 1
			myDict = { "barcode": barcode,
				"blocked": False,
				"botid": "null",
				"coordinate": "[%d,%d]"%(xcoords,ycoords),
				"neighbours": neighbours,
				"size_info": size_info,
				"store_status": store_status,
				"zone": "defzone"
			}
			if len(myDict.keys())>0:
				mainList.append(myDict)
			count+=1
	return mainList

def getChargerLocation(charger_dict,matrix_cord):
	world_cord = (charger_dict['Position X'],charger_dict['Position Y'])
	charger_barcode,coordinate = findBarcodeFromLocation(world_cord,matrix_cord)
	return charger_barcode,coordinate

def getChargerEntryPoint(charger_dict,matrix_cord):
	world_cord = tuple(json.loads(charger_dict['CHARGER_ENTRY_POINT']))
	entrypoint_barcode,coordinate = findBarcodeFromLocation(world_cord,matrix_cord)
	return entrypoint_barcode,coordinate


def createChargerJson(mapping_charger,matrix_cord):
	chargerJson = {}
	chargerList = []
	coordinate_dict = {}
	reinit_dict = {} 
	for charger_dict in mapping_charger:
		charger_location,coordinate = getChargerLocation(charger_dict,matrix_cord)
		charger_entrypoint,reinit_cordinate = getChargerEntryPoint(charger_dict,matrix_cord)
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


def createSectorJson(matrix_cord,allCords):
	sector_list = []
	for coord,loc in matrix_cord.items():
		if matrix_cord[coord] in allCords:
			sector_list.append(coord)
	sectorList = [(re.sub(r'\s+', '', str(i))).replace('(','[').replace(')',']') for i in sector_list]
	sector_json = [{"0":sectorList}]
	return sector_json
	
def findBarcodeFromLocation(world_cordinate_location,matrix_cord):
	location = ''
	matrix_cord_key = list(matrix_cord.keys())
	matrix_cord_value = list(matrix_cord.values())

	new_pos = matrix_cord_value.index(world_cordinate_location)
	coordinate = matrix_cord_key[new_pos]
	barcode = "%03d.%03d"%(coordinate[1],coordinate[0])
	return barcode,coordinate

def createOdsJson(ods_mapping,matrix_cord):
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

def getAdjcencyCord(get_reinit_neighbour,barcodesDict):
	adjacency_list = []
	all_cords = list(barcodesDict.keys())
	for item in get_reinit_neighbour:
		if item in all_cords:
			adjacency_list.append(list(item))
		else:
			adjacency_list.append(None)
	return adjacency_list


def addChargers(charger_coord,direction,reinit,barcodesDict):
	x,y = charger_coord
	r_x,r_y = reinit
	reinit_barcode_dict = barcodesDict[reinit]
	get_reinit_neighbour = [(r_x,r_y-1),(r_x-1,r_y),(r_x,r_y+1),(r_x+1,r_y)]
	reinit_barcode_dict['neighbours'][direction] = [1, 1, 0]
	reinit_barcode_dict['neighbours'][(direction + 2) % 4] = [1, 1, 0]
	get_adjecency_coord = getAdjcencyCord(get_reinit_neighbour,barcodesDict)
	reinit_barcode_dict['adjacency'] = get_adjecency_coord

	get_charger_neighbour = [(x,y-1),(x-1,y),(x,y+1),(x+1,y)]
	charger_barcode_dict = barcodesDict[charger_coord]
	charger_barcode_dict['neighbours'][direction][2] = 0
	for index,item in enumerate(get_charger_neighbour):
		if index != direction:
			charger_barcode_dict['neighbours'][index][1] = 0
			charger_barcode_dict['neighbours'][index][2] = 0
	get_charger_adjecency_coord = getAdjcencyCord(get_charger_neighbour,barcodesDict)
	charger_barcode_dict['adjacency'] = get_charger_adjecency_coord

	e_x,e_y = get_reinit_neighbour[direction]
	get_entry_barcode_dict = barcodesDict[get_reinit_neighbour[direction]]
	get_entry_barcode_dict['neighbours'][(direction + 2) % 4][2] = 0
	get_entry_neighbour = [(e_x,e_y-1),(e_x-1,e_y),(e_x,e_y+1),(e_x+1,e_y)]
	get_entry_barcode_coord = getAdjcencyCord(get_entry_neighbour,barcodesDict)
	get_entry_barcode_dict['adjacency'] = get_entry_barcode_coord


	for index,item in enumerate(get_charger_neighbour):
		if item != reinit and item in list(barcodesDict.keys()):
			barcodesDict[item]['neighbours'][(index + 2) % 4][1] = 0
			barcodesDict[item]['neighbours'][(index + 2) % 4][2] = 0
	return barcodesDict


def convertNormalise(data):
	normalise_list = []
	for k,v in data.items():
		normalise_list.append(v)
	return normalise_list

def convertDenormalize(data):
	denomalize_dict = {}
	for item in data:
		coord = tuple(ast.literal_eval(item['coordinate']))
		denomalize_dict[coord] = item
	return denomalize_dict

@app.route('/data',methods=['GET', 'POST'])
def my_link():
	req_file = request.files
	df = pd.read_excel(req_file["arrFile"])
	ods_exclude = df[~df['ODS_EXCLUDED'].isnull()]
	df_pps = df[~df['PPS_STATION_ID'].isnull()]
	zone_df = df[~df['ZONE_ID'].isnull()]
	df_charger = df[~df['CHARGER_ID'].isnull()]
	allCords = list(df[['Position X', 'Position Y']].apply(tuple, axis=1))
	x_loc = sorted(df['Position X'].unique(),reverse=True)
	y_loc = sorted(df['Position Y'].unique(),reverse=True)
	matric_cord_name_mapping = df.groupby(['Position X','Position Y'])['Name'].apply(list).to_dict()
	matrix_cord = create_matrix(x_loc,y_loc)
	data = create_map(matrix_cord,allCords,matric_cord_name_mapping)
	ods_json = createOdsJson(ods_exclude.to_dict('records'),matrix_cord)
	pps_json = createPpsJson(df_pps.to_dict('records'),matrix_cord)
	ZoneJson = createZoneJson(list(set(zone_df['ZONE_ID'])))
	SectorJson = createSectorJson(matrix_cord,allCords)
	charger_json,charger_cordinate = createChargerJson(df_charger.to_dict('records'),matrix_cord)
	data = create_map(matrix_cord,allCords,matric_cord_name_mapping)
	convertMapDataDenormalize = convertDenormalize(data)

	for charger_coord,reinit in charger_cordinate.items():
		new_map = addChargers(charger_coord,reinit[0],reinit[1],convertMapDataDenormalize)
		data = convertNormalise(new_map)

	return {'mapJson':data , 'odsExcludedJson':ods_json , 'ppsJson':pps_json , 'zoneJson':ZoneJson , 'sectorJson':SectorJson, 'chargerJson':charger_json}


if __name__ == '__main__':
	app.run('10.11.4.14', port=5000)