from flask import Flask,request
from flask_cors import CORS
import os
import pandas as pd
app = Flask(__name__)
CORS(app)
import json
import re

def create_matrix(x_loc,y_loc):
	CoordDict = {}
	for y_index,y_val in enumerate(y_loc):
		for x_index,x_val in enumerate(x_loc):
			GridCoord =  (x_index+1, y_index+1)
			CoordDict[GridCoord] = (x_val, y_val)
	return CoordDict

def findNeighbourData(imstorable,coords,matrix_cord,allDict):
	l = [0,0,0]
	if coords in matrix_cord and matrix_cord[coords] in allDict:
		l[0] = 1
		l[1] = 1
		neighbourstorable = matrix_cord[coords]
		if imstorable =="s" and neighbourstorable == "s":
			l[2] =0
		else:
			l[2] =1
	return l
		
def getNeighbour(coords,matrix_cord,imstorable,allCords):
	x,y = coords
	coordList = [(x,y-1),(x-1,y),(x,y+1),(x+1,y)]
	mainList = []
	for ncoord in coordList:
		mainList.append(findNeighbourData(imstorable,ncoord, matrix_cord,allCords))
	return mainList

def calculate_size_info(value1, value2):
	return abs(value1-value2)//2

def cal_size_info(x, y, matrix_cord,allDict):
	size_info_list = []
	north,south,east,west = 750,750,750,750

	if (x,y-1) in matrix_cord and matrix_cord[(x,y-1)] in allDict:
		north = calculate_size_info(matrix_cord[(x,y)][1], matrix_cord[(x,y-1)][1])
	if (x-1,y) in matrix_cord and matrix_cord[(x-1,y)] in allDict:
		east = calculate_size_info(matrix_cord[(x,y)][0], matrix_cord[(x-1,y)][0])
	if (x,y+1) in matrix_cord and matrix_cord[(x,y+1)] in allDict:
		south = calculate_size_info(matrix_cord[(x,y+1)][1], matrix_cord[(x,y)][1])
	if (x+1,y) in matrix_cord and matrix_cord[(x+1,y)] in allDict:
		west = calculate_size_info(matrix_cord[(x+1,y)][0], matrix_cord[(x,y)][0])
	return [int(north),int(east),int(south),int(west)]

def create_map(matrix_cord,allCords,matric_cord_name_mapping):
	myDict = {}
	mainList = []
	count = 0
	for grid_cord,loc_cord in matrix_cord.items():
		if loc_cord in allCords:
			rtype = 's' if "storage" in matric_cord_name_mapping[loc_cord][0].lower() else "p"
			xloc,yloc,rtype,xcoords, ycoords = loc_cord[0],loc_cord[1],rtype,grid_cord[0],grid_cord[1]
			barcode = "%03d.%03d"%(ycoords,xcoords)
			neighbours =getNeighbour((xcoords,ycoords),matrix_cord,rtype,allCords)
			myDict = {"neighbours": neighbours}
			if rtype =="p":
				store_status = 0
			elif rtype =="s":
				store_status = 1
			size_info = cal_size_info(xcoords, ycoords, matrix_cord, allCords)
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



@app.route('/data',methods=['GET', 'POST'])
def my_link():
	req_file = request.files
	df = pd.read_csv(req_file["arrFile"])
	ods_exclude = df[~df['ODS_EXCLUDED'].isnull()]
	allCords = list(df[['Position X', 'Position Y']].apply(tuple, axis=1))
	x_loc = sorted(df['Position X'].unique(),reverse=True)
	y_loc = sorted(df['Position Y'].unique(),reverse=True)
	matric_cord_name_mapping = df.groupby(['Position X','Position Y'])['Name'].apply(list).to_dict()
	matrix_cord = create_matrix(x_loc,y_loc)
	data = create_map(matrix_cord,allCords,matric_cord_name_mapping)
	create_ods_json = createOdsJson(ods_exclude.to_dict('records'),matrix_cord)
	return {'mapJson':data , 'odsExcludedJson':create_ods_json}

 

if __name__ == '__main__':
	app.run(debug=True)