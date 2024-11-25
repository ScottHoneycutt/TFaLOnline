const helper = require('./helper.js'); 
const React = require('react');
const { useState, useEffect } = React;
const { createRoot } = require('react-dom/client');

//Method is called when a user tries to submit a new score to the scoreboard -SJH
const handleScore = (e, onScoreAdded) => {
    e.preventDefault();
    helper.hideError();

    const username = e.target.querySelector('#username').value;
    const newScore = e.target.querySelector('#newScore').value;

    if (!newScore) {
        helper.handleError('Score input required'); 
        return false;
    }
    helper.sendPost(e.target.action, { username: username, score: newScore }, onScoreAdded);
    return false;
}

//React component for the HTML "add scores" form -SJH
const ScoreForm = (props) => {
    return (
        <form id="scoreForm"
            onSubmit={(e) => handleScore(e, props.triggerReload)}
            name="scoreForm"
            action="/scoreboard" method="POST"
            className="scoreForm"
        >
            <label htmlFor="name">Username (overridden by account username if logged in): </label>
            <input id="username" type="text" name="name" placeholder="Username" />
            <label htmlFor="score">Score: </label>
            <input id="newScore" type="number" min="0" name="score" />
            <input className="addScoreSubmit" type="submit" value="Add new score" />
        </form>
    );
};

//React component for the HTML scores list -SJH
const ScoreList = (props) => {
    const [scores, setScores] = useState(props.scores);

    useEffect(() => {
        const loadScoresFromServer = async () => {
            const response = await fetch('/getAllScores');
            const data = await response.json();
            console.log(data);
            setScores(data.highscores);
        };

        loadScoresFromServer();
        console.log("loadScoresFromServer done");
    }, [props.reloadScores]);

    console.log(scores);

    if (scores.length === 0) {
        return (
            <div className="scoresList">
                <h3 className="emptyScore">No scores Yet!</h3>
            </div>);
    }
    console.log("checked length of scores object done (surpassed no scores case)");

    const scoreNodes = scores.map(score => {
        return (
            <div key={score.id} className="score">
                <h3 className="username">User: {score.username}</h3>
                <h3 className="score">Score: {score.score}</h3>
            </div>);
    });
    console.log("Finished creating an array of score nodes");
    return (
        <div className="scoreList">
            {scoreNodes}
        </div>);
}


const App = () => {
  const [reloadScores, setReloadScores] = useState(false);
  return (
    <div>
      <div id="Addscores">
        <ScoreForm triggerReload={() => setReloadScores(!reloadScores)} />
      </div>
      <div id="scores">
        <ScoreList scores={[]} reloadScores={reloadScores} />
      </div>
    </div>);
};

const init = () => {
  const root = createRoot(document.getElementById('app')); 
  root.render(<App />);
};

window.onload = init;