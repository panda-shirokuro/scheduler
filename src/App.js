import './App.css';
import { useState,useEffect } from 'react';
import AppBar from '@material-ui/core/AppBar';
import { Toolbar, Container, Typography, Button } from '@material-ui/core';
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
		marginTop: 50
	},
	submitButton: {
		marginTop: 10
	},
	header: {
		height: 60
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
			<Button variant="contained" color="primary" className={classes.submitButton}>送信</Button>
			<footer className={classes.footer} >
				<Copyright />
			</footer>
		</div>
	);
}

const Board = (props) => {
	const classes = useStyles();
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
					return (<DayScheduler update={(datetime,bool) => updateAttendance(datetime,bool)} day={day} times={Object.entries(times).filter(keyVal => moment(new Date(keyVal[0])).isSame(day,'day'))} key={`days-${index}`}/>);
				});
			return days
		} catch (error) {
			console.log(error);
			return (<Typography>クエリ文字列に誤りがあります</Typography>);
		}
	};

	return (
		<Container className={classes.main}>
			{calenderElement(params)}
		</Container>
	)
}



export default App;
