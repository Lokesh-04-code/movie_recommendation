from flask import Flask, request, jsonify
import pickle
import requests
from difflib import get_close_matches
from flask_cors import CORS
import os
import gdown  # for Google Drive download

app = Flask(__name__)
CORS(app)

# ===============================
# Config: Google Drive file IDs
# Replace with your actual file IDs
# ===============================
MOVIES_FILE_ID = "1wbvNa1s7QUZGDhLTPGnbkpwIPlNB_ms0"       # movies.pkl file id
SIMILARITY_FILE_ID = "1bwSJpjqfm7xOCWchn8pXn3hBzPY6l-3N"  # similarity.pkl file id

# Local file paths
MOVIES_PATH = "movies.pkl"
SIMILARITY_PATH = "similarity.pkl"

# ===============================
# Helper: Download file from Google Drive if missing
# ===============================
def download_file(file_id, output_path):
    if not os.path.exists(output_path):
        print(f"Downloading {output_path} from Google Drive...")
        url = f"https://drive.google.com/uc?id={file_id}"
        gdown.download(url, output_path, quiet=False)

# Ensure both files exist
download_file(MOVIES_FILE_ID, MOVIES_PATH)
download_file(SIMILARITY_FILE_ID, SIMILARITY_PATH)

# ===============================
# Load data
# ===============================
new_df = pickle.load(open(MOVIES_PATH, 'rb'))
similarity = pickle.load(open(SIMILARITY_PATH, 'rb'))

# ===============================
# Functions
# ===============================
def fetch_poster(movie_id):
    try:
        response = requests.get(
            f'https://api.themoviedb.org/3/movie/{movie_id}?api_key=632ac11fb783d2f156576b2d24181e00&language=en-US',
            timeout=5
        )
        data = response.json()
        return "https://image.tmdb.org/t/p/w185/" + data['poster_path']
    except:
        return None

# ===============================
# Routes
# ===============================
@app.route('/movies', methods=['GET'])
def get_movies():
    titles = new_df['title'].tolist()
    return jsonify(titles)

@app.route('/recommend', methods=['GET'])
def recommend():
    movie = request.args.get('movie')
    if not movie:
        return jsonify({'error': 'Movie name is required'}), 400

    all_titles = new_df['title'].tolist()
    closest_match = get_close_matches(movie, all_titles, n=1)
    if not closest_match:
        return jsonify({'error': 'Movie not found'}), 404

    movie_index = new_df[new_df['title'] == closest_match[0]].index[0]
    distances = similarity[movie_index]
    movies_list1 = sorted(list(enumerate(distances)), reverse=True, key=lambda x: x[1])[1:6]

    recommended_movies = []
    for i in movies_list1:
        movie_id = new_df.iloc[i[0]].movie_id
        title = new_df.iloc[i[0]].title
        poster = fetch_poster(movie_id)
        recommended_movies.append({'title': title, 'poster': poster})

    return jsonify(recommended_movies)

# ===============================
# Entry point
# ===============================
if __name__ == '__main__':
    # Local run
    app.run(host="0.0.0.0", port=5000, debug=True)
