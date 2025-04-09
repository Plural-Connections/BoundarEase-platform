from backend import app, db, models
from sqlalchemy import desc, and_, or_, func
from sqlalchemy_searchable import search
from flask import (
    jsonify,
    request,
    render_template,
    session,
    redirect,
    make_response,
    url_for,
)
from flask_cors import cross_origin

# from application_only_auth import Client

import random
import datetime
import time
import json
import urllib
import requests
import numpy as np
import csv

# import boto3
import pprint
import mimetypes
import base64
import hashlib
from collections import Counter, defaultdict

# TODO: make sure to create the constants.py file (reference README)
from backend.constants import * 

# Set session storage
app.config["SESSION_TYPE"] = SESSION_TYPE
app.config["SECRET_KEY"] = SECRET_KEY

########################################################################################################################

@app.route("/")
@app.route("/start-questions")
@app.route("/share-thoughts")
@app.route("/final-page")
def index():
    return render_template("index.html")


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def catch_all(path):
    return render_template("index.html")

@app.route("/api/time")
def get_current_time():
    return {"time": time.time()}

@app.route("/api/init_session", methods=["GET"])
@cross_origin()
def init_session():
    # assign experiment

    # Create session
    new_session = models.UserSession(
        referral_key="",
        # lang='en',
        timestamp=datetime.datetime.utcnow(),
        session_hash="",
        ranking="",
        address=None,
        lat=None,
        long=None,
        block_id=None,
    )
    db.session.add(new_session)
    db.session.commit()

    # print(new_session.session_id)

    curr_session_id = hashlib.sha1(
        str(new_session.session_id).encode("UTF-8")
    ).hexdigest()[0:HASH_LEN]
    new_session.session_hash = curr_session_id
    db.session.commit()

    data = {"session_id": curr_session_id}

    return jsonify(**data)


@app.route("/api/save_ranking", methods=["POST"])
@cross_origin()
def save_ranking():
    data = json.loads(request.data)
    session_hash = data["session_id"]
    ranking = data["ranking"]
    # print(ranking)

    # update the session
    session = models.UserSession.query.filter_by(session_hash=session_hash).first()

    session.ranking = ranking

    db.session.commit()

    return jsonify({"response": "ok"})


@app.route("/api/save_feedback", methods=["POST"])
@cross_origin()
def save_feedback():
    data = json.loads(request.data)
    session_hash = data["session_id"]
    scenario_id = data["scenario_id"]
    rating = data["rating"]
    feedback = data["feedback"]

    # print(session_hash)
    # print(scenario_id)
    # print(rating)
    # print(feedback)

    # get the actual session_id
    session = models.UserSession.query.filter_by(session_hash=session_hash).first()
    session_id = str(session.session_id)

    # print(session_id)
    # print(type(session_id))
    # print(type(scenario_id))

    # see if there is an entry in ScenarioFeedback for the particular session_id and scenario_id
    feedback_entry = models.ScenarioFeedback.query.filter_by(
        session_id=session_id, scenario_id=scenario_id
    ).first()

    if feedback_entry:
        # update the rating and feedback fields
        feedback_entry.rating = rating
        feedback_entry.feedback = feedback
        db.session.commit()
    else:
        # create a new entry in the table
        new_feedback_entry = models.ScenarioFeedback(
            session_id=session_id,
            scenario_id=scenario_id,
            rating=rating,
            feedback=feedback,
        )
        db.session.add(new_feedback_entry)
        db.session.commit()

    return jsonify({"response": "ok"})

@app.route("/api/get_diversity_data_all/<scenario_id>", methods=["GET"])
@cross_origin()
def get_scenario_diversity_data(scenario_id):
    data_to_return = [
        s.as_dict()
        for s in models.ScenarioDiversityData.query.filter_by(
            scenario_id=scenario_id
        ).all()
    ]

    try:
        return jsonify(*data_to_return)
    except Exception as e:
        return "error"


@app.route("/api/get_utilization_data_all/<scenario_id>", methods=["GET"])
@cross_origin()
def get_scenario_utilization_data(scenario_id):
    data_to_return = [
        s.as_dict()
        for s in models.ScenarioUtilizationData.query.filter_by(
            scenario_id=scenario_id
        ).all()
    ]

    try:
        return jsonify(*data_to_return)
    except Exception as e:
        return "error"


@app.route("/api/get_travel_data_all/<scenario_id>", methods=["GET"])
@cross_origin()
def get_scenario_travel_data_all(scenario_id):
    travel_info = models.ScenarioTravelData.query.filter_by(
        scenario_id=scenario_id
    ).all()

    num_students_increase = 0
    num_students_decrease = 0
    num_students_no_change = 0

    for t in travel_info:
        if t.time_change_description == "no change":
            num_students_no_change += t.num_high_in_block
        elif t.time_change_description == "decrease":
            num_students_decrease += t.num_high_in_block
        else:
            num_students_increase += t.num_high_in_block

    to_return = {
        "num_students_no_change": num_students_no_change,
        "num_students_decrease": num_students_decrease,
        "num_students_increase": num_students_increase,
    }

    return jsonify(to_return)


@app.route(
    "/api/get_travel_data_personalized/<session_hash>/<scenario_id>", methods=["GET"]
)
@cross_origin()
def get_scenario_travel_data(session_hash, scenario_id):
    session = models.UserSession.query.filter_by(session_hash=session_hash).first()

    # print('found session')

    result = models.ScenarioTravelData.query.filter_by(
        scenario_id=scenario_id, block_id=session.block_id
    ).first()

    # print('found block')

    if result:
        return jsonify(result.as_dict())

    # TODO: handle this more gracefully, for different conditions (like if it's because there's no block_id or other reasons)
    else:
        return "error"


@app.route("/api/get_feeder_data_all/<scenario_id>", methods=["GET"])
@cross_origin()
def get_scenario_feeder_data(scenario_id):
    data_to_return = [
        s.as_dict()
        for s in models.ScenarioFeederData.query.filter_by(
            scenario_id=scenario_id
        ).all()
    ]

    return jsonify(*data_to_return)


@app.route("/api/get_sankey_feeder_data/", methods=["GET"])
@cross_origin()
def get_sankey_feeder_data():
    # based on the session and scenario ids, return the sankey data as a JSON

    scenario_id = request.args.get("scenario_id", default="-1", type=str)
    session_hash = request.args.get("session_id", default="", type=str)
    # session_hash = "972a67c481"

    # get the user's feeder pattern data
    session = models.UserSession.query.filter_by(session_hash=session_hash).first()
    result = models.ScenarioBlockFeederData.query.filter_by(
        scenario_id=scenario_id, block_id=session.block_id
    ).first()

    if not result:
        return "error"

    # get their school names
    user_data = result.as_dict()
    user_es = user_data["elem_school_name"]
    user_ms = user_data["middle_school_name"]
    user_hs = user_data["high_school_name"]

    # get the feeder pattern data for the scenario
    feeder_data = [
        s.as_dict()
        for s in models.ScenarioFeederData.query.filter_by(
            scenario_id=scenario_id
        ).all()
    ]

    if not feeder_data:
        return "error"
    # print(feeder_data)

    # create the empty json structure that we will fill in with the feeder pattern data
    sankey_data = {"nodes": [], "links": []}
    # list to keep track of nodes we added already
    nodes = {}  # key is name and value is node id
    # list to keep track of links we added already
    es_links = set()
    ms_links = (
        {}
    )  # key is first_school_name,second_school_name and value is number of students
    ms_links_split = (
        {}
    )  # key is first_school_name,second_school_name and value is whether the link is split

    # iterate through feeder_data
    for pattern in feeder_data:
        es = pattern["elem_school_name"]
        ms = pattern["middle_school_name"]
        hs = pattern["high_school_name"]

        # add new nodes and links if applicable
        if es not in nodes:
            if es == user_es:
                sankey_data["nodes"].append(
                    {
                        "node": len(sankey_data["nodes"]),
                        "name": es.strip(),
                        "type": "user",
                    }
                )
            else:
                sankey_data["nodes"].append(
                    {
                        "node": len(sankey_data["nodes"]),
                        "name": es.strip(),
                        "type": "elementary",
                    }
                )
            nodes[es] = len(sankey_data["nodes"]) - 1

        if ms not in nodes:
            if ms == user_ms:
                sankey_data["nodes"].append(
                    {
                        "node": len(sankey_data["nodes"]),
                        "name": ms.strip(),
                        "type": "user",
                    }
                )
            else:
                sankey_data["nodes"].append(
                    {
                        "node": len(sankey_data["nodes"]),
                        "name": ms.strip(),
                        "type": "middle",
                    }
                )
            nodes[ms] = len(sankey_data["nodes"]) - 1

        if hs not in nodes:
            if hs == user_hs:
                sankey_data["nodes"].append(
                    {
                        "node": len(sankey_data["nodes"]),
                        "name": hs.strip(),
                        "type": "user",
                    }
                )
            else:
                sankey_data["nodes"].append(
                    {
                        "node": len(sankey_data["nodes"]),
                        "name": hs.strip(),
                        "type": "high",
                    }
                )
            nodes[hs] = len(sankey_data["nodes"]) - 1

        # add links if applicable
        # check if link from es to ms exists
        if f"{es},{ms}" not in es_links and es != ms:
            # need to add link from es to ms
            sankey_data["links"].append(
                {
                    "source": nodes[es],
                    "target": nodes[ms],
                    # "source": es,
                    # "target": ms,
                    "value": pattern["rescaled_elem_to_middle_students"],
                    "is_split": pattern["elementary_split"],
                }
            )
            es_links.add(f"{es},{ms}")

        # check if link from ms to hs exists
        if f"{ms},{hs}" not in ms_links and ms != hs:
            # add a new value to links
            ms_links[f"{ms},{hs}"] = pattern["rescaled_middle_to_high_students"]
            ms_links_split[f"{ms},{hs}"] = pattern["middle_split"]
        # else, add new value to current value
        else:
            ms_links[f"{ms},{hs}"] += pattern["rescaled_middle_to_high_students"]
            # if pattern["middle_split"] is true then set ms_links_split[f"{ms},{hs}"] to true
            if pattern["middle_split"]:
                ms_links_split[f"{ms},{hs}"] = pattern["middle_split"]

    # iterate through the ms_links and add them to sankey data
    for link in ms_links:
        # get the ms and hs from the link
        ms = link.split(",")[0]
        hs = link.split(",")[1]
        sankey_data["links"].append(
            {
                "source": nodes[ms],
                "target": nodes[hs],
                "value": ms_links[link],
                "is_split": ms_links_split[link],
            }
        )

    return jsonify(sankey_data)


@app.route("/api/get_feeder_data_personalized/", methods=["GET"])
@cross_origin()
def get_scenario_feeder_data_personalized():
    # all_data = json.loads(request.data)
    # scenario_id = all_data["scenario_id"]
    # session_hash = all_data["session_id"]

    scenario_id = request.args.get("scenario_id", default="-1", type=str)
    session_hash = request.args.get("session_id", default="", type=str)

    session = models.UserSession.query.filter_by(session_hash=session_hash).first()

    result = models.ScenarioBlockFeederData.query.filter_by(
        scenario_id=scenario_id, block_id=session.block_id
    ).first()

    if result:
        result_dict = result.as_dict()
        # add in the splits
        feeder_data = models.ScenarioFeederData.query.filter_by(
            scenario_id=scenario_id,
            elem_school_name=result_dict["elem_school_name"],
            middle_school_name=result_dict["middle_school_name"],
            high_school_name=result_dict["high_school_name"],
        ).first()

        if feeder_data:
            feeder_data_dict = feeder_data.as_dict()

            result_dict["elementary_split"] = feeder_data_dict["elementary_split"]
            result_dict["middle_split"] = feeder_data_dict["middle_split"]

        return jsonify(result_dict)

    # TODO: handle this more gracefully, for different conditions (like if it's because there's no block_id or other reasons)
    else:
        return "error"


@app.route("/api/encode_address/", methods=["POST"])
@cross_origin()
def encode_address():
    all_data = json.loads(request.data)
    address = all_data["address"]
    session_hash = all_data["session_id"]

    # Geocode address to get lat long
    geocode_url = "https://maps.googleapis.com/maps/api/geocode/json?address={}&sensor=true&key={}".format(
        urllib.parse.quote(address), GOOGLE_API_KEY
    )
    lat_long = json.loads(requests.get(geocode_url).content.decode("utf-8"))["results"][
        0
    ]["geometry"]["location"]
    lat = lat_long["lat"]
    long = lat_long["lng"]

    # Get ID of census block containing this lat long
    fcc_url = "https://geo.fcc.gov/api/census/area?lat={}&lon={}&format=json"
    result = json.loads(requests.get(fcc_url.format(lat, long)).content.decode("utf-8"))
    block_id = result["results"][0]["block_fips"]

    # Store in the relevant session
    session = models.UserSession.query.filter_by(session_hash=session_hash).first()
    session.address = address
    session.lat = lat
    session.long = long
    session.block_id = block_id
    db.session.commit()

    return jsonify(session.as_dict())

@app.route("/api/get_boundaries/<scenario_id>", methods=["GET"])
@cross_origin()
def get_boundaries(scenario_id):
    data_to_return = [
        s.as_dict()
        # for s in models.SchoolDataMapping.query.filter_by(
        # scenario_id=scenario_id
        for s in models.ScenarioBlockFeederData.query.filter_by(
            scenario_id=scenario_id
        ).all()
    ]

    return jsonify(data_to_return)


@app.route("/api/get_mega_boundaries/<scenario_id>", methods=["GET"])
@cross_origin()
def get_mega_boundaries(scenario_id):
    data = [
        s.as_dict()
        for s in models.MegaBoundaries.query.filter_by(scenario_id=scenario_id).all()
    ]

    geojson = []
    for boundary in data:
        coordinates = []

        # Processing of geometry data in the form of a string
        # str = boundary['boundaries'][1:-1]
        # split = str.split(", (")

        str = boundary["boundaries"][14:]
        split = str.split(",")

        for coords in split:
            coords = coords.replace("(", "")
            coords = coords.replace(")", "")
            pair = coords.split()

            pair = [float(pair[0]), float(pair[1])]

            coordinates.append(pair)

        block = {
            "type": "Feature",
            "properties": {
                "school_id": boundary["school_id"],
                "scenario_id": boundary["scenario_id"],
            },
            "geometry": {
                "type": "MultiPolygon",
                # "coordinates": [boundary["boundaries"]]
                "coordinates": [[coordinates]],
            },
        }

        geojson.append(block)

    return jsonify(geojson)


@app.route("/api/get_school_locations", methods=["GET"])
@cross_origin()
def get_school_locations():
    data_to_return = [s.as_dict() for s in models.SchoolDataMapping.query.all()]

    return jsonify(data_to_return)


@app.route("/api/get_student_perspectives/<ranking>", methods=["GET"])
@cross_origin()
def get_student_perspectives(ranking):
    lowest_ind = ranking.index("4")
    second_lowest_ind = ranking.index("3")
    key = RANKING_MAPPING[lowest_ind] + "__" + RANKING_MAPPING[second_lowest_ind]
    stories = models.StudentStories.query.filter_by(pillars_key=key).first()
    # TODO: change this when stories outputs an array
    return jsonify({"stories": [stories.as_dict()]})


@app.route("/api/get_google_api_key", methods=["GET"])
@cross_origin()
def get_google_api_key():
    to_return = {"key": GOOGLE_API_KEY}
    return jsonify(**to_return)
