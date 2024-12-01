const helper = require('./helper.js'); 
const React = require('react');
const { useState, useEffect } = React;
const { createRoot } = require('react-dom/client');

//React component for this user's profile info -SJH
const MyProfile = (props) => {
    const [profileInfo, setProfileInfo] = useState(props.scores);

    //Grab refreshed profile data from the server -SJH
    useEffect(() => {
        const loadprofileFromServer = async () => {
            const response = await fetch('/getProfileData');
            const data = await response.json();
            setProfileInfo(data.info);
        };

        loadprofileFromServer();
    }, [props.reloadScores]);

    return(
        <div>
            <h1>{profileInfo.username}</h1>
            <h3>{profileInfo.gamesPlayed} games played</h3>
        </div>
    )
}

//React component for this user's scores list -SJH
const MyScoreList = (props) => {
    const [scores, setScores] = useState(props.scores);

    useEffect(() => {
        const loadScoresFromServer = async () => {
            const response = await fetch('/getAllScores');
            const data = await response.json();
            setScores(data.highscores);
        };

        loadScoresFromServer();
    }, [props.reloadScores]);

    //If there are no scores, return an HTML display message stating that -SJH
    if (scores.length === 0) {
        return (
            <div className="scoresList">
                <h3 className="emptyScore">No scores yet! Play some TFaL to record your scores!</h3>
            </div>);
    }

    //Create a new HTML "row" for each score that is recieved. -SJH
    const scoreNodes = scores.map(score => {
        return (
            <div key={score.id} className="score">
                <h3 className="username">Date: {score.createdDate}</h3>
                <h3 className="score">Score: {score.score}</h3>
            </div>);
    });

    return (
        <div className="myScoreList">
            {scoreNodes}
        </div>);
}


//React component for rendering out this page -SJH
const App = () => {
  const [reloadScores, setReloadScores] = useState(false);
  return (
    <div>
      <div id="profileInfo">
        <MyProfile/>
      </div>
      <div id="scores">
        <MyScoreList scores={[]} reloadScores={reloadScores}/>
      </div>
    </div>);
};

//Runs on window load -SJH
const init = () => {
  const root = createRoot(document.getElementById('app')); 
  root.render(<App/>);
};

window.onload = init;