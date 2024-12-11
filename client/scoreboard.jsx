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
// const ScoreForm = (props) => {
//     return (
//         <form id="scoreForm"
//             onSubmit={(e) => handleScore(e, props.triggerReload)}
//             name="scoreForm"
//             action="/scoreboard" method="POST"
//             className="scoreForm">
//             <label htmlFor="name">Username (overridden by account username if logged in): </label>
//             <input id="username" type="text" name="name" placeholder="Username" />
//             <label htmlFor="score">Score: </label>
//             <input id="newScore" type="number" min="0" name="score" />
//             <input className="addScoreSubmit" type="submit" value="Add new score" />
//         </form>
//     );
// };

//React component for the HTML scores list -SJH
const ScoreList = (props) => {
    const [scores, setScores] = useState(props.scores);

    useEffect(() => {
        const loadScoresFromServer = async () => {
            const response = await fetch('/getAllScores');
            const data = await response.json();
            //Get the colors of each score and append it to the score so it can be used 
            //when mapping later -SJH
            for (let i = 0; i < data.highscores.length; i++) {
                const colorRes = await fetch("/userColor", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({username: data.highscores[i].username}),
                });
                const colorData = await colorRes.json();
                console.log(colorData);
                data.highscores[i].color = colorData.color;
            }

            setScores(data.highscores);
        };

        loadScoresFromServer();
    }, [props.reloadScores]);


    if (scores.length === 0) {
        return (
            <div className="scoresList">
                <h3 className="emptyScore">No scores Yet!</h3>
            </div>);
    }
    //Map the scores to HTML elements -SJH
    const scoreNodes = scores.map(score => {
        return (
            <div style ={{backgroundColor: score.color}} key={score.id} className="score">
                <h3 className="username">User: {score.username}</h3>
                <h3 className="score">Score: {score.score}</h3>
            </div>);
    });
    return (
        <div className="scoreList">
            {scoreNodes}
        </div>);
}


const App = () => {
  const [reloadScores, setReloadScores] = useState(false);
  return (
    <div>
      <div id="scores">
        <ScoreList scores={[]} reloadScores={reloadScores} />
      </div>
    </div>);
};

const init = () => {
  const root = createRoot(document.getElementById('app')); 
  root.render(<App/>);
};

window.onload = init;