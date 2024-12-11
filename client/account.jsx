const helper = require('./helper.js'); 
const React = require('react');
const { useState, useEffect } = React;
const { createRoot } = require('react-dom/client');

//Redirects to the change password page -SJH
const changePasswordPage = () =>{
    fetch("/changePasswordPage");
}

//Logs the user out -SJH
const logout = () => {
    fetch("/logout");
}

//React component for this user's profile info -SJH
const MyProfile = () => {
    const [profileInfo, setProfileInfo] = useState("");

    //Grab refreshed profile data from the server -SJH
    useEffect(() => {
        const loadprofileFromServer = async () => {
            const response = await fetch('/getProfileData');
            const data = await response.json();
            setProfileInfo(data);
            //console.log(data);
        };

        loadprofileFromServer();
    }, []); //Empty brackets here makes useEffect only run on first render -SJH

    //Runs when the client is toggling premium on/off -SJH
    const changePremium = () => {
        console.log("changePremium called");
        profileInfo.profile.premium = !profileInfo.profile.premium;

        const postData = {
            username: profileInfo.profile.username, 
            gamesPlayed: profileInfo.profile.gamesPlayed, 
            premium: profileInfo.profile.premium, 
            color: profileInfo.profile.color};
        helper.sendPost("/modifyProfile", postData, profileModificationDone);
    }

    //Runs when the client changes their profile color -SJh
    const changeColor = () => {
        console.log("changeColor called");
        profileInfo.profile.color = document.querySelector("#colorPicker").value;

        const postData = {
            username: profileInfo.profile.username, 
            gamesPlayed: profileInfo.profile.gamesPlayed, 
            premium: profileInfo.profile.premium, 
            color: profileInfo.profile.color};
        helper.sendPost("/modifyProfile", postData, profileModificationDone);
    }

    //Refreshes this react HTML component on the page -SJH
    const profileModificationDone = async () => {
        const response = await fetch('/getProfileData');
        const data = await response.json();
        setProfileInfo(data);
    }

    console.log(profileInfo);
    //Check to see if the data is there -SJH
    if (profileInfo){
        //Check if it should display premium or non-premium view -SJH
        if (profileInfo.profile.premium === true) {
            return(
                <div style={{backgroundColor: profileInfo.profile.color}}>
                    <h1>{profileInfo.profile.username}</h1>
                    <h3>Games Played: {profileInfo.profile.gamesPlayed}</h3>
                    <label for="colorPicker">Scoreboard Color:</label>
                    <input type="color" id="colorPicker" onChange={changeColor} value={profileInfo.profile.color}></input>
                    <label for="premiumToggle">Premium:</label>
                    <button type="button" id="premiumToggle" onClick={changePremium}>On</button> 
                    {/* <button type="button" id="logoutButton" onClick={logout}>Log Out</button>
                    <button type="button" id="changePassButton" onClick={changePasswordPage}>Change Password</button> */}
                </div>
            );
        }
        //Non-premium profile display -SJH
        else {
            return(
                <div>
                    <h1>{profileInfo.profile.username}</h1>
                    <h3>Games Played: {profileInfo.profile.gamesPlayed}</h3>
                    <label for="premiumToggle">Premium:</label>
                    <button type="button" id="premiumToggle" onClick={changePremium}>Off</button> 
                    {/* <button type="button" id="logoutButton" onClick={logout}>Log Out</button>
                    <button type="button" id="changePassButton" onClick={changePasswordPage}>Change Password</button> */}
                </div>
            );
        }
    }

    //When the server is waiting for a response from the database -SJH
    return (<div><h1>Loading Data...</h1></div>);
}

//React component for this user's scores list -SJH
const MyScoreList = () => {
    //useState updates scores (first return) whenever setScores (second return) is run -SJH
    const [scores, setScores] = useState("");

    //useEffect runs on render for this react component -SJH
    useEffect(() => {
        const loadScoresFromServer = async () => {
            const response = await fetch('/getMyHighscores');
            const data = await response.json();
            console.log(data.highscores);
            setScores(data.highscores);
        };

        loadScoresFromServer();
    }, []); //Empty brackets here makes useEffect only run on first render -SJH

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
  return (
    <div>
      <div id="profileInfo">
        <MyProfile/>
      </div>
      <div id="scores">
        <MyScoreList/>
      </div>
    </div>);
};

//Runs on window load -SJH
const init = () => {
    const root = createRoot(document.getElementById('content')); 
    root.render(<App/>);
};

window.onload = init;