import './App.css';
import { useState,useEffect } from 'react';
import AppBar from '@material-ui/core/AppBar';
import { Toolbar, Container, Typography, Button, Box} from '@material-ui/core';
import Link from '@material-ui/core/Link';
import { makeStyles } from "@material-ui/core/styles";
import queryString from 'query-string';
// import * as holiday from '@holiday-jp/holiday_jp';
// import moment from 'moment';
// import DayScheduler from './components/scheduler.js';
// import * as deepcopy from 'deepcopy';
// import { BrowserRouter, Route, Link } from "react-router-dom";
import InputBoard from './components/inputBoard.js'

const useStyles = makeStyles((theme) => ({
	footer: {
		padding: theme.spacing(2),
		height: 80
	},
	main: {
		marginTop: 10,
		marginLeft: 0,
		marginRight: 0,
		paddingLeft: 0,
		paddingRight: 0
	},
	header: {
		height: 60,
	},
	sample: {
		display: 'flex',
		justifyContent: 'flex-end',
		paddingRight: 10,
		paddingLeft: 10,

	},
	sampleBox: {
        fontSize: 20,
        marginTop: 5,
        marginBottom: 5,
        marginRight: 1,
        marginLeft: 1,
        borderRadius: 10,
        color: 'gray'		
	},
	toolbar: {
		width: '100%',
		backgroundColor: 'white',
		display: 'flex',
		position: 'fixed',
		margin: 0,
		height: 50,
		bottom: 0,
		zIndex: 999
	}
}));



const Copyright = () => {
	return (
		<Typography variant="body2" align="center" color="textSecondary">
			{"Copyright © "}
			<Link color="inherit" href="https://github.com/barisu">
				barisu
      </Link>{" "}
			{new Date().getFullYear()}
			{"."}
		</Typography>
	);
}

function App() {
	const classes = useStyles();
	const qp = queryString.parse(window.location.search);
	const [userName,setUserName] = useState('hogehogeのhoge太郎');
	const iniUserName = () => {
		let name = window.prompt('なまえをいれてね！','');
		if (!name) {
			name = '名無し';
		}
		setUserName(name);
	};


	useEffect(() => {
	});

	return (
		<div className="App">
			<AppBar className={classes.header} position="sticky" >
				<Toolbar>
					<Typography variant="h5" align="left" >
						Scheduler
            		</Typography>
				</Toolbar>
			</AppBar>
			<Typography onClick={() => iniUserName()}>{userName}様</Typography>
			<InputBoard queryParams={qp} userName={userName} className={classes.main}/>
			<footer className={classes.footer} >
				<Copyright />
			</footer>
		</div>
	);
}



export default App;
