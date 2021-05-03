import {useState} from 'react';
import { makeStyles } from "@material-ui/core/styles";
import { Card, Box,Typography } from '@material-ui/core';
import * as deepcopy from 'deepcopy';

const useStyles = makeStyles({
    card: {
        display: 'flex',
        flexDirection: 'column',
        marginTop: 10,
        minHeight: 30
    },
    selectors: {
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
    },
    title: {
        textAlign: 'left',
        paddingLeft: '5%',
        paddingRight: '5%'
    },
    touchSquare: {
        height: 40,
        width: 40,
        fontSize: 25,
        marginTop: 15,
        marginBottom: 15
    }
})

const DayScheduler = (props) => {
    const classes = useStyles();
    const date = props.day;
    const [attendance,setAttendance] = useState(Object.fromEntries(props.times));
    const findElementId = (x,y) => {
        for (const obj of props.times){
            const id = obj[0];
            const elementCoord = document.getElementById(id).getBoundingClientRect();
            if (elementCoord.left <= x && x <= elementCoord.right && elementCoord.top <= y && y <= elementCoord.bottom){
                return id;
            }
        }
        return null;
    }

    const touchStart = (event) => {
        const id = event.target.id;
        if (id) {
            if (attendance[id] === props.times.find(obj => obj[0] === id)[1]){
                attendance[id] = !attendance[id];
                setAttendance(deepcopy(attendance));
            }
        }
    }

    const touchMove = (event) => {
        const id = findElementId(event.touches[0].clientX,event.touches[0].clientY);
        if (id) {
            if (attendance[id] === props.times.find(obj => obj[0] === id)[1]){
                attendance[id] = !attendance[id];
                setAttendance(deepcopy(attendance))
            }
        }
    };

    const touchEnd = () => {
        for (const obj of Object.entries(attendance)) {
            const id = obj[0];
            const bool = obj[1];
            props.update(id,bool);
        }
    }

    const times = props.times.map((obj) => {
        const time = obj[0];
        const isAttended = attendance[time];
        const timeObj = new Date(time);
        let backgroundColor = 'green';
        if (isAttended) {
            backgroundColor = 'red';
        }
        return (
            <div 
                className={classes.touchSquare}
                style={{backgroundColor: backgroundColor}}
                id={timeObj.toLocaleString()}
                key={timeObj.toLocaleString()}
                onTouchStart={(e) => touchStart(e)}
                onTouchEnd={() => touchEnd()}
                onTouchMove={(e) => touchMove(e)}
            >
                {timeObj.getHours()}
            </div>)
    });
    return (
        <Card className={classes.card}>
            <Typography className={classes.title} color='secondary'>{date.toLocaleDateString()}</Typography>
            <Box 
                className={classes.selectors}
            >
                {times}
            </Box>
        </Card>
    )
}

export default DayScheduler;
