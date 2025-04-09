###########################################################################################################################
# Import libraries
###########################################################################################################################

import enum
from backend import db
from sqlalchemy import desc, or_, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.schema import Index
import re
import time

from flask_sqlalchemy import BaseQuery
from sqlalchemy_searchable import SearchQueryMixin, make_searchable
from sqlalchemy_utils.types import TSVectorType

make_searchable(db.metadata)

###########################################################################################################################
# Helper class
###########################################################################################################################


class JsonModel(object):
    def as_dict(self):
        return {
            c.name: getattr(self, c.name)
            for c in self.__table__.columns
            if c.name != "search_vector"
        }


# class ObjectEnums(enum.Enum):
#     SURVEY = "survey"
#     SCENARIO_SET = "scenario set"
#     MEETING_MINUTES = "meeting"
#     DEADLINE = "deadline"
#     TODO = "to-do item"


###########################################################################################################################
# Session table
# new entry created for each website visit.
###########################################################################################################################


class UserSession(db.Model, JsonModel):
    session_id = db.Column(db.BigInteger, primary_key=True)
    referral_key = db.Column(db.String)
    # lang = db.Column(db.String) # language
    timestamp = db.Column(db.DateTime)
    session_hash = db.Column(db.String)
    ranking = db.Column(db.String)
    address = db.Column(db.String, nullable=True)
    lat = db.Column(db.Float, nullable=True)
    long = db.Column(db.Float, nullable=True)
    block_id = db.Column(db.String, nullable=True)

    def __init__(
        self,
        referral_key,
        timestamp,
        session_hash,
        ranking,
        address,
        lat,
        long,
        block_id,
    ):
        self.referral_key = referral_key
        # self.lang = lang
        self.timestamp = timestamp
        self.session_hash = session_hash
        self.ranking = ranking
        self.address = address
        self.lat = lat
        self.long = long
        self.block_id = block_id


###########################################################################################################################
# Session event table for event tracking
# new entry created for every event a user did (posts done after every page).
# pretty simple to allow for more flexibility.
###########################################################################################################################


class SessionEvent(db.Model, JsonModel):
    id = db.Column(db.BigInteger, primary_key=True)
    session_id = db.Column(db.String)
    event_type = db.Column(db.String)  # name of event
    event_detail = db.Column(db.String)  # JSON
    timestamp = db.Column(db.DateTime)

    def __init__(self, session_id, event_type, event_detail, timestamp):
        self.session_id = session_id
        self.event_type = event_type
        self.event_detail = event_detail
        self.timestamp = timestamp


###########################################################################################################################
# Table to track diversity scenarios/data
###########################################################################################################################


class ScenarioDiversityData(db.Model, JsonModel):
    id = db.Column(db.BigInteger, primary_key=True)
    school_nces = db.Column(db.String)
    school_name = db.Column(db.String)
    scenario_id = db.Column(db.String)  # name of event
    percent_low_ses = db.Column(db.Float)  # JSON
    percent_med_ses = db.Column(db.Float)
    percent_high_ses = db.Column(db.Float)
    low_ses_dist_from_ideal = db.Column(db.Float)
    num_students = db.Column(db.Float)

    def __init__(
        self,
        school_nces,
        school_name,
        scenario_id,
        percent_low_ses,
        percent_med_ses,
        percent_high_ses,
        low_ses_dist_from_ideal,
        num_students,
    ):
        self.school_nces = school_nces
        self.school_name = school_name
        self.scenario_id = scenario_id
        self.percent_low_ses = percent_low_ses
        self.percent_med_ses = percent_med_ses
        self.percent_high_ses = percent_high_ses
        self.low_ses_dist_from_ideal = low_ses_dist_from_ideal
        self.num_students = num_students


###########################################################################################################################
# Table to track travel time data by scenario
###########################################################################################################################


class ScenarioTravelData(db.Model, JsonModel):
    id = db.Column(db.BigInteger, primary_key=True)
    block_id = db.Column(db.String)
    num_high_in_block = db.Column(db.Integer)
    scenario_id = db.Column(db.String)
    old_school_name = db.Column(db.String)
    new_school_name = db.Column(db.String)
    old_travel_time = db.Column(db.Float)
    new_travel_time = db.Column(db.Float)
    time_change_description = db.Column(db.String)

    def __init__(
        self,
        block_id,
        scenario_id,
        old_school_name,
        new_school_name,
        old_travel_time,
        new_travel_time,
        time_change_description,
        num_high_in_block,
    ):
        self.block_id = block_id
        self.scenario_id = scenario_id
        self.old_school_name = old_school_name
        self.new_school_name = new_school_name
        self.old_travel_time = old_travel_time
        self.new_travel_time = new_travel_time
        self.time_change_description = time_change_description
        self.num_high_in_block = num_high_in_block


###########################################################################################################################
# Table to track feeder pattern data by scenario
###########################################################################################################################


class ScenarioFeederData(db.Model, JsonModel):
    id = db.Column(db.BigInteger, primary_key=True)
    scenario_id = db.Column(db.String)
    elem_school_name = db.Column(db.String)
    elem_school_nces = db.Column(db.String)
    middle_school_name = db.Column(db.String)
    middle_school_nces = db.Column(db.String)
    high_school_name = db.Column(db.String)
    high_school_nces = db.Column(db.String)
    elem_to_middle_students = db.Column(db.Integer)
    rescaled_elem_to_middle_students = db.Column(db.Integer)
    middle_to_high_students = db.Column(db.Integer)
    rescaled_middle_to_high_students = db.Column(db.Integer)
    high_students = db.Column(db.Integer)
    elementary_split = db.Column(db.Boolean)
    middle_split = db.Column(db.Boolean)

    def __init__(
        self,
        scenario_id,
        elem_school_name,
        elem_school_nces,
        middle_school_name,
        middle_school_nces,
        high_school_name,
        high_school_nces,
        elem_to_middle_students,
        rescaled_elem_to_middle_students,
        middle_to_high_students,
        rescaled_middle_to_high_students,
        high_students,
        elementary_split,
        middle_split,
    ):
        self.scenario_id = scenario_id
        self.elem_school_name = elem_school_name
        self.elem_school_nces = elem_school_nces
        self.middle_school_name = middle_school_name
        self.middle_school_nces = middle_school_nces
        self.high_school_name = high_school_name
        self.high_school_nces = high_school_nces
        self.elem_to_middle_students = elem_to_middle_students
        self.rescaled_elem_to_middle_students = rescaled_elem_to_middle_students
        self.middle_to_high_students = middle_to_high_students
        self.rescaled_middle_to_high_students = rescaled_middle_to_high_students
        self.high_students = high_students
        self.elementary_split = elementary_split
        self.middle_split = middle_split

###########################################################################################################################
# Table to track feeder pattern data by block, by scenario
###########################################################################################################################

class ScenarioBlockFeederData(db.Model, JsonModel):
    id = db.Column(db.BigInteger, primary_key=True)
    block_id = db.Column(db.String)
    scenario_id = db.Column(db.String)
    elem_school_name = db.Column(db.String)
    elem_school_nces = db.Column(db.String)
    middle_school_name = db.Column(db.String)
    middle_school_nces = db.Column(db.String)
    high_school_name = db.Column(db.String)
    high_school_nces = db.Column(db.String)
    num_elem_in_block = db.Column(db.Integer)
    rescaled_num_elem_in_block = db.Column(db.Integer)
    num_middle_in_block = db.Column(db.Integer)
    rescaled_num_middle_in_block = db.Column(db.Integer)
    num_high_in_block = db.Column(db.Integer)

    def __init__(
        self,
        block_id,
        scenario_id,
        elem_school_name,
        elem_school_nces,
        middle_school_name,
        middle_school_nces,
        high_school_name,
        high_school_nces,
        num_elem_in_block,
        rescaled_num_elem_in_block,
        num_middle_in_block,
        rescaled_num_middle_in_block,
        num_high_in_block,
    ):
        self.block_id = block_id
        self.scenario_id = scenario_id
        self.elem_school_name = elem_school_name
        self.elem_school_nces = elem_school_nces
        self.middle_school_name = middle_school_name
        self.middle_school_nces = middle_school_nces
        self.high_school_name = high_school_name
        self.high_school_nces = high_school_nces
        self.num_elem_in_block = num_elem_in_block
        self.rescaled_num_elem_in_block = rescaled_num_elem_in_block
        self.num_middle_in_block = num_middle_in_block
        self.rescaled_num_middle_in_block = rescaled_num_middle_in_block
        self.num_high_in_block = num_high_in_block


###########################################################################################################################
# Table to track utilization scenarios/data
###########################################################################################################################


class ScenarioUtilizationData(db.Model, JsonModel):
    id = db.Column(db.BigInteger, primary_key=True)
    school_nces = db.Column(db.String)
    school_name = db.Column(db.String)
    scenario_id = db.Column(db.String)
    num_students = db.Column(db.Integer)
    student_capacity = db.Column(db.Integer)

    def __init__(
        self,
        school_nces,
        school_name,
        scenario_id,
        num_students,
        student_capacity,
    ):
        self.school_nces = school_nces
        self.school_name = school_name
        self.scenario_id = scenario_id
        self.num_students = num_students
        self.student_capacity = student_capacity


###########################################################################################################################
# Table to keep track of user responses for a particular scenario
# new entry created for every scenario and user combo
###########################################################################################################################


class ScenarioFeedback(db.Model, JsonModel):
    id = db.Column(db.BigInteger, primary_key=True)
    session_id = db.Column(db.String)
    scenario_id = db.Column(db.String)
    rating = db.Column(db.String)
    feedback = db.Column(db.String)

    def __init__(self, session_id, scenario_id, rating, feedback):
        self.session_id = session_id
        self.scenario_id = scenario_id
        self.rating = rating
        self.feedback = feedback

# ARCHIVED
###########################################################################################################################
# Table for perspective-getting stories based on Pillar ranking
###########################################################################################################################
# class PerspectiveGettingStories(db.Model, JsonModel):
#     id = db.Column(db.BigInteger, primary_key=True)
#     original_ranking = db.Column(db.String)
#     reverse_ranking = db.Column(db.String)
#     stories = db.Column(db.String)

#     def __init__(self, original_ranking, reverse_ranking, stories):
#         self.original_ranking = original_ranking
#         self.reverse_ranking = reverse_ranking
#         self.stories = stories

###########################################################################################################################
# Table for perspective-getting stories based on bottom-two ranked stories
###########################################################################################################################
class StudentStories(db.Model, JsonModel):
    id = db.Column(db.BigInteger, primary_key=True)
    pillars_key = db.Column(db.String)
    story_text = db.Column(db.String)
    story_quote = db.Column(db.String)

    def __init__(self, pillars_key, story_text, story_quote):
        self.pillars_key = pillars_key
        self.story_text = story_text
        self.story_quote = story_quote

###########################################################################################################################
# Table for storing mega boundaries for a scenario
###########################################################################################################################
class MegaBoundaries(db.Model, JsonModel):
    id = db.Column(db.BigInteger, primary_key=True)
    school_id = db.Column(db.String) # school id based on ncessch
    scenario_id = db.Column(db.String)
    boundaries = db.Column(db.String)

    def __init__(self, school_id, scenario_id, boundaries):
        self.school_id = school_id
        self.scenario_id = scenario_id
        self.boundaries = boundaries


###########################################################################################################################
# Table for mapping which blocks are assigned to which school
###########################################################################################################################
class SchoolDataMapping(db.Model, JsonModel):
    id = db.Column(db.BigInteger, primary_key=True)
    school_id = db.Column(db.String) # school id based on ncessch
    school_name = db.Column(db.String)
    lat = db.Column(db.String) # latitude of the school
    long = db.Column(db.String) # longitude of the school

    def __init__(self, school_id, school_name, lat, long):
        self.school_id = school_id
        self.school_name = school_name
        self.lat = lat
        self.long = long

# ARCHIVED FOR MVP
###########################################################################################################################
# Object table for each item i.e. object on the timeline
# used to render timeline object cards, one row for every object
###########################################################################################################################
class TimelineObject(db.Model, JsonModel):
    id = db.Column(db.BigInteger, primary_key=True)
    # object_type = db.Column(db.Enum("survey", "scenario set", "deadline", "to-do item", "meeting"), name="object_types")
    object_type = db.Column(
        db.String
    )  # one of the following: "survey", "scenario set", "deadline", "meeting", or "to-do item"
    object_title = db.Column(db.String)  # appears on object"s timeline card
    object_date = db.Column(db.Date)  # date that object is released, occurs, etc.
    object_desc = db.Column(db.String)
    timestamp = db.Column(db.DateTime)
    is_deleted = db.Column(db.Boolean, default=False)

    def __init__(
        self, object_type, object_title, object_date, object_desc, timestamp, is_deleted
    ):
        self.object_type = object_type
        self.object_title = object_title
        self.object_date = object_date
        self.object_desc = object_desc
        self.timestamp = timestamp
        self.is_deleted = is_deleted

# ARCHIVED FOR MVP
###########################################################################################################################
# Meeting minutes table
###########################################################################################################################
class MeetingMinutes(db.Model, JsonModel):
    id = db.Column(db.BigInteger, primary_key=True)
    meeting_summary = db.Column(db.String)
    meeting_presentation = db.Column(db.String)
    meeting_recording = db.Column(db.String)
    meeting_notes = db.Column(db.String)
    meeting_feedback_link = db.Column(db.String)
    timestamp = db.Column(db.DateTime)
    is_deleted = db.Column(db.Boolean, default=False)

    def __init__(
        self,
        meeting_summary,
        meeting_presentation,
        meeting_recording,
        meeting_notes,
        meeting_feedback_link,
        timestamp,
        is_deleted,
    ):
        self.meeting_summary = meeting_summary
        self.meeting_presentation = meeting_presentation
        self.meeting_recording = meeting_recording
        self.meeting_notes = meeting_notes
        self.meeting_feedback_link = meeting_feedback_link
        self.timestamp = timestamp
        self.is_deleted = is_deleted

# ARCHIVED FOR MVP
###########################################################################################################################
# Table for folks who subscribe to updates
###########################################################################################################################
class UserSubscription(db.Model, JsonModel):
    id = db.Column(db.BigInteger, primary_key=True)
    session_hash = db.Column(db.String)
    name = db.Column(db.String, nullable=True)
    email = db.Column(db.String, nullable=True)
    phone_number = db.Column(db.String, nullable=True)
    email_consent = db.Column(db.Boolean, default=False)
    phone_consent = db.Column(db.Boolean, default=False)
    timestamp = db.Column(db.DateTime)
