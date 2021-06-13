import { useState } from 'react';
import { Container, Typography, Button, Box} from '@material-ui/core';
import * as holiday from '@holiday-jp/holiday_jp';
import moment from 'moment';
import DayScheduler from './byDayScheduler.js';
import * as deepcopy from 'deepcopy';
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
	main: {
		marginTop: 10,
		marginLeft: 0,
		marginRight: 0,
		paddingLeft: 0,
		paddingRight: 0
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


const InputBoard = (props) => {
	const classes = useStyles();
	const params = props.queryParams;
	const [inputState,setInputState] = useState(true);
	
    let onlyDayOff = params.onlyDayOff;
    if (onlyDayOff === 'true') {
		onlyDayOff = true
    } else {
		onlyDayOff = false;
    }
	
	
	const iniTimes = function (params){
		let result = {};
        let workdayStartTime = params.workdayStartTime;
        let workdayEndTime = params.workdayEndTime;
        let dayOffStartTime = params.dayOffStartTime;
        let dayOffEndTime = params.dayOffEndtime;
		
		
        if (workdayStartTime == null) {
			workdayStartTime = '07:00:00';
        }
        if (workdayEndTime == null) {
			workdayEndTime = '23:00:00';
        }
        if (dayOffStartTime == null) {
			dayOffStartTime = '07:00:00';
        }
        if (dayOffEndTime == null) {
			dayOffEndTime = '23:00:00';
        }
		
		
		try {
			
			const startDate = new Date(params.startDate);
			const endDate = new Date(params.endDate);
			for(let dayCnt = 0; dayCnt <= (endDate - startDate) / (60 * 60 * 1000 * 24);dayCnt++){
				const day = moment(startDate).add(dayCnt, 'd').toDate();
				const workdayStartDatetime = new Date(day.toLocaleDateString() + ' ' + workdayStartTime);
				const workdayEndDatetime = new Date(day.toLocaleDateString() + ' ' + workdayEndTime);
				const dayOffStartDatetime = new Date(day.toLocaleDateString() + ' ' + dayOffStartTime);
				const dayOffEndDatetime = new Date(day.toLocaleDateString() + ' ' + dayOffEndTime);
                
				if (isDayOff(day)){
					for(let i = 0; i <= (dayOffEndDatetime - dayOffStartDatetime)/(1000 * 60 * 60); i++){
						result[moment(dayOffStartDatetime).add(i, 'h').toDate().toLocaleString()] = false;
					}
				} else if (!onlyDayOff) {
					for(let i = 0; i <= (workdayEndDatetime - workdayStartDatetime)/(1000 * 60 * 60); i++){
						result[moment(workdayStartDatetime).add(i, 'h').toDate().toLocaleString()] = false;
					}
				}
			}
		} catch (error) {
			console.log(error);
		}
		return result;
	}(params);
	const [times, setTimes] = useState(iniTimes);
	
	const api = () => {
		let name = window.prompt('なまえをいれてね！','');
		let password = window.prompt('パスワードをいれてね！','');
		if (password && name) {
			fetch('/schedule',{
				method: 'POST',
				cache: 'no-cache',
				credentials: 'same-origin',
				headers: {
					'Content-Type': 'application/json'
					},
				body: JSON.stringify({times: times,name : name, event_cd : params.event_cd, password: password})
			}).then(
				(result) => {
					if (result.status === 200) {
	
					}
				},
				(error) => {
					console.log(error);
				}
			)
		} else {
			alert('入力が足りないよ！');
		}
	}

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
                    if (isDayOff(day)) {
                        return (<DayScheduler inputState={inputState} update={(datetime,bool) => updateAttendance(datetime,bool)} day={day} times={Object.entries(times).filter(keyVal => moment(new Date(keyVal[0])).isSame(day,'day'))} key={`days-${index}`}/>);
                    } else if (!onlyDayOff) {
                        return (<DayScheduler inputState={inputState} update={(datetime,bool) => updateAttendance(datetime,bool)} day={day} times={Object.entries(times).filter(keyVal => moment(new Date(keyVal[0])).isSame(day,'day'))} key={`days-${index}`}/>);
                    } else {
                        return null;
                    }
				}).filter(component => component != null);
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
					<Button onClick={() => {setInputState(null)}} className={classes.sampleBox} style={{backgroundColor: '#cbcacb'}} variant="outlined">未定</Button>
					<Button onClick={() => {setInputState(true)}} className={classes.sampleBox} style={{backgroundColor: '#80c2fc'}} variant="outlined">出席</Button>
					<Button onClick={() => {setInputState(false)}} className={classes.sampleBox} style={{backgroundColor: '#ffe887'}} variant="outlined">欠席</Button>	
				</Box>
			</Box>
		</Container>
	)
}


export default InputBoard;