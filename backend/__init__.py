from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS, cross_origin

# TODO: update based on paths to react stuff
app = Flask(
    __name__,
    template_folder="../my-app/build/",
    static_folder="../my-app/build/static/",
)
CORS(app)
app.config.from_object("config")
db = SQLAlchemy(app)

# import os
# os.system('nohup redis-server &')
# os.system('nohup rqworker &')
# os.system('nohup rqscheduler &')

from backend import models
from backend import views
