# BoundarEase-platform

This repo contains the source code for the platform described in "BoundarEase: Fostering Constructive Community Engagement to Inform More Equitable Student Assignment Policies".

You can cite our work as follows:
```
@article{overney2025boundarease,
  title={BoundarEase: Fostering Constructive Community Engagement to Inform More Equitable Student Assignment Policies},
  author={Overney, Cassandra and Moe, Cassandra and Chang, Alvin and Gillani, Nabeel},
  journal={arXiv preprint arXiv:2503.08543},
  year={2025}
}
```

## Breakdown of repo

A quick explanation of main folders:

- `backend/` - database design (`models.py`), API scripts (`views.py`)
- `my-app/` - the frontend (react) files. `App.js` is the main file that stitches everything together.  Most of the remaining files correspond to React components
- `V9cscw040_supmat.pdf` - a PDF of the supplementary materials 

NOTE: we did not include the database scripts or data to keep the identity of the school district anonymous. If you want examples of our data structure you can reference the below files. Adapting the test data with your actual data in a database and connecting it to the scripts within the `backend` folder should be sufficient. 
- `my-app/src/map-data/array_of_GeoJSON.json`: contains test data for the map feature
- `my-app/src/test-data/diversity.json`: contains test data for the diversity pillar
- `my-app/src/test-data/feeder.json`: contains test data for the feeder pattern pillar
- `my-app/src/test-data/sankey.json`: contains test data for the school utilization pillar

 
## Developing locally

### Frontend
- `cd my-app`
- (first time, to build dependences) `npm install`
- `npm start` to serve the front-end application (will default to port 3000)

#### To add new packages:

`npm install <package name>`

This is used when you want to use a react module that someone else has already developed.  You can find many of those [here](https://www.npmjs.com/package/).

### Backend

- Create and activate a virtual environment in the root directory
- After activating the virtual environment, run `pip install -r requirements.txt` from the root folder
- Manually create a `constants.py` file in the backend folder to include the following information

```
# Flask constants
SESSION_TYPE = "filesystem"
SECRET_KEY = TO FILL

# Other constants
GOOGLE_API_KEY = TO FILL
RANKING_MAPPING = ["diversity", "feeder_stability", "utilization", "travel"]
HASH_LEN = 10
MAX_REV_PER_TOPIC = 15
MIN_REV_FOR_TOPICS = 3
MIN_SCHOOL_FOR_TOPICS = 3
MAX_TOPICS = 10
```

#### Running backed server locally

`PYTHONPATH=. python backend/run.py` (will default to port 8888)

Test out that the API is running and that you can get data back by visiting the following in your browser: `http://localhost:8888/api/time` — it should return the unix timestamp of the current time (the code returning this is in `backend/views.py`)