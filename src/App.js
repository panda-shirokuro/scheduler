import './App.css';
import { useState,useEffect } from 'react';
import AppBar from '@material-ui/core/AppBar';
import { Toolbar, Container, Typography, Button, Box} from '@material-ui/core';
import Link from '@material-ui/core/Link';
import { makeStyles } from "@material-ui/core/styles";
import queryString from 'query-string';
import * as holiday from '@holiday-jp/holiday_jp';
import moment from 'moment';
import DayScheduler from './components/scheduler.js';
import * as deepcopy from 'deepcopy';



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

const isDayOff = (date) => {
	const dayOfTheWeek = date.getDay();
	if (dayOfTheWeek <= 1 || holiday.isHoliday(date)) {
		return true;
	}
	else {
		let yesterday = moment(date).subtract(1, 'd');
		while (holiday.isHoliday(yesterday)) {
			if (yesterday.getDay() === 0) {
				return true;
			}
			yesterday = moment(yesterday).subtract(1, 'd');
		}
		return false;
	}
}


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
			<Board queryParams={qp} className={classes.main}/>
			<footer className={classes.footer} >
				<Copyright />
			</footer>
		</div>
	);
}










const Board = (props) => {
	const classes = useStyles();
	const [inputState,setInputState] = useState(true);
	const userName = useState(null);
	const params = props.queryParams;
	const iniTimes = function (params){
		let result = {};
		try {
			const startDate = new Date(params.startDate);
			const endDate = new Date(params.endDate);
			for(let dayCnt = 0; dayCnt <= (endDate - startDate) / (60 * 60 * 1000 * 24);dayCnt++){
				const day = moment(startDate).add(dayCnt, 'd').toDate();
				const workdayStartTime = new Date(day.toLocaleDateString() + ' ' + params.workdayStartTime);
				const workdayEndTime = new Date(day.toLocaleDateString() + ' ' + params.workdayEndTime);
				const dayOffStartTime = new Date(day.toLocaleDateString() + ' ' + params.dayOffStartTime);
				const dayOffEndTime = new Date(day.toLocaleDateString() + ' ' + params.dayOffEndTime);

				if (isDayOff(day)){
					for(let i = 0; i <= (dayOffEndTime - dayOffStartTime)/(1000 * 60 * 60); i++){
						result[moment(dayOffStartTime).add(i, 'h').toDate().toLocaleString()] = false;
					}
				} else {
					for(let i = 0; i <= (workdayEndTime - workdayStartTime)/(1000 * 60 * 60); i++){
						result[moment(workdayStartTime).add(i, 'h').toDate().toLocaleString()] = false;
					}
				}
			}
		} catch (error) {
			console.log(error);
		}
		return result;
	}(params);

	const api = () => {
		fetch('/schedule',{
			method: 'POST',
			cache: 'no-cache',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json'
				},
			body: JSON.stringify({times: times,name : userName})
		}).then(
			(result) => {
			},
			(error) => {
				console.log(error);
			}
		)
	}

	const [times, setTimes] = useState(iniTimes);
	const updateAttendance = (datetime,bool) => {
		const dt = new Date(datetime);
		const dtStr = dt.toLocaleString();
		if (bool !== times[dtStr]){
			times[dtStr] = bool;
			setTimes(deepcopy(times));
		}
	}
	const calenderElement = function (params) {
		try {
			const startDate = new Date(params.startDate);
			const endDate = new Date(params.endDate);
			const days = new Array((endDate - startDate) / (60 * 60 * 1000 * 24) + 1).fill()
				.map((_, index) => {
					const day = moment(startDate).add(index, 'd').toDate();
					return (<DayScheduler inputState={inputState} update={(datetime,bool) => updateAttendance(datetime,bool)} day={day} times={Object.entries(times).filter(keyVal => moment(new Date(keyVal[0])).isSame(day,'day'))} key={`days-${index}`}/>);
				});
			return days
		} catch (error) {
			console.log(error);
			return (<Typography>クエリ文字列に誤りがあります</Typography>);
		}
	};

	return (
		<Container className={classes.main}>
			<Container>
				{calenderElement(params)}
				<Button 
					variant="contained" 
					style={{color: 'white'}}
					color="primary" 
					className={classes.sampleBox}
					onClick={() => api()}
				>
					送信
				</Button>
			</Container>
			<Box className={classes.toolbar}>
				<Box className={classes.sample}>
					<Button onClick={() => {setInputState(null)}} className={classes.sampleBox} style={{backgroundColor: '#ffe887'}} variant="outlined">未定</Button>
					<Button onClick={() => {setInputState(true)}} className={classes.sampleBox} style={{backgroundColor: '#cbcacb'}} variant="outlined">出席</Button>
					<Button onClick={() => {setInputState(false)}} className={classes.sampleBox} style={{backgroundColor: '#80c2fc'}} variant="outlined">欠席</Button>	
				</Box>
			</Box>
		</Container>
	)
}



export default App;
