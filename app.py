from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

high_scores = []

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/api/save-score", methods=["POST"])
def save_score():
    if request.is_json:
        data = request.get_json()
        name = data["name", "Anonymous"]
        score = int(data.get("score", 0))

        high_scores.append({"name": name, "score": score})
        high_scores.sort(key=lambda x: x["score"], reverse=True)
        high_scores[: ] = high_scores[:5] #this keeps only the top 5 scores

        return jsonify(success=True)
    else:
        return jsonify(error="Request must be JSON"), 415

@app.route("/api/highscores", methods=["GET"])
def get_high_scores():
    return jsonify(high_scores)

if __name__ == "__main__":
    app.run(debug=True)