import React from 'react';
import ReactDOM from 'react-dom';

const Timeline = React.createClass({
    getInitialState() {
        return {
            minCursorX: 0,
            maxCursorX: 0,
            minCursorDate: 0,
            maxCursorDate: 0
        }
    },

    getDefaultProps() {
        return {
            dates: {},
            onChange: null,
            onChangeDelay: 250,
            cursorSize: 75
        }
    },

    componentWillMount() {
        this._getMinMaxDates();
        this._addListeners();
    },

    componentWillUnmount() {
        this._removeListeners();
    },

    componentDidMount() {
        this._setWindowVars();
    },

    render() {
        const minCursorStyle = {
            transform: `translateX(${this.state.minCursorX}px)`,
            width: this.props.cursorSize
        };

        const maxCursorStyle = {
            transform: `translateX(${this.state.maxCursorX}px)`,
            width: this.props.cursorSize
        };

        const timeRangeStyle = {
            transform: `translateX(${this.state.minCursorX}px)`,
            width: this.state.maxCursorX - this.state.minCursorX + this.props.cursorSize
        };

        return (
            <div className="timeline-wrapper" ref={(ref) => this.timelineWrapper = ref}>
                <div className="timeline-available">
                    {this._getAvailableYearsHtml(this.state.minTime, this.state.maxTime)}
                </div>
                <div className="timeline-range" style={timeRangeStyle}></div>
                <div className="time-cursor time-cursor--min"
                     ref={(ref) => this.minCursor = ref}
                     style={minCursorStyle}
                     onMouseDown={this._handleMouseDown.bind(this, 'min')}
                    >{this.state.minCursorDate}
                </div>
                <div className="time-cursor time-cursor--max"
                     ref={(ref) => this.maxCursor = ref}
                     style={maxCursorStyle}
                     onMouseDown={this._handleMouseDown.bind(this, 'max')}
                    >{this.state.maxCursorDate}</div>
            </div>
        );
    },

    _handdleDrag(event) {
        let state = {};

        const index = this.state.activeCursor;
        const cursorSize = this.props.cursorSize;
        let translateValue = event.clientX - (this.maxCursor.offsetLeft);


        if ( index === 'max' ) {
            if ( translateValue > this.state.wrapperSize - cursorSize ) translateValue = this.state.wrapperSize - cursorSize;
            if ( translateValue < this.state.minCursorX + this.props.cursorSize ) translateValue = this.state.minCursorX + this.props.cursorSize;
        }

        if ( index === 'min' ) {
            if ( translateValue < 0 ) translateValue = 0;
            if ( translateValue > this.state.maxCursorX - this.props.cursorSize) translateValue = this.state.maxCursorX - this.props.cursorSize;
        }

        state[`${index}CursorX`] = translateValue;

        this.setState(state, () => {
            this._updateValue();
        });

    },

    _handleChange() {
        if (this.props.onChange !== null && typeof this.props.onChange === 'function') {
            this.props.onChange(this.state)
        }
    },

    _getMinMaxDates() {
        const dates = this.props.dates;
        let minTime;
        let maxTime;

        if(dates) {
            minTime = dates[0].time;
            maxTime = dates[0].time;

            for(let date of dates) {
                if(date.time < minTime) minTime = date.time;
                if(date.time > maxTime) maxTime = date.time;
            }

            minTime = new Date(minTime*1000).getFullYear();
            maxTime = new Date(maxTime*1000).getFullYear();

            this.setState(
                {
                    minTime,
                    maxTime,
                    minCursorDate: minTime,
                    maxCursorDate: minTime
                }
            )
        }
    },

    _getAvailableYearsHtml(min, max) {
        let html = [];

        if ( typeof this.state.timeScale === 'undefined' ) return null;

        const style = {
            width: this.state.timeScale + 'px'
        };

        for(min; min <= max; min++) {
            html.push(<div className="time-block" style={style} key={`year-${min}`} >{min}</div>)
        }

        return html;
    },

    _handleMouseUp()
    {
        window.removeEventListener('mousemove', this._handdleDrag, true);
    },

    _handleMouseDown(cursor){
        this.setState(
            {
                activeCursor: cursor
            }, () => {
                window.addEventListener('mousemove', this._handdleDrag, true);
            }
        )
    },

    _handleResize() {
        this._setWindowVars();
    },

    _addListeners() {
        window.addEventListener('mouseup', this._handleMouseUp, false);
        window.addEventListener('resize', this._handleResize, false);
    },

    _removeListeners() {
        window.removeEventListener('mouseup', this._handleMouseUp, false);
        window.removeEventListener('resize', this._handleResize, false);
    },

    _setWindowVars() {
        const time = this.state.maxTime - this.state.minTime;
        const wrapperSize = this.timelineWrapper.offsetWidth;
        const timeScale = wrapperSize / time;

        this.setState(
            {
                wrapperSize,
                timeScale
            }
        )
    },

    _updateValue() {
        const minCursorDate = this.state.minTime + parseInt(this.state.minCursorX / this.state.timeScale);
        const maxCursorDate = this.state.minTime + parseInt(this.state.maxCursorX / this.state.timeScale);
        const minCursorTimestamp = this._getFirstDayTimestamp(minCursorDate);
        const maxCursorTimestamp = this._getLastDayTimestamp(maxCursorDate);

        this.setState(
            {   minCursorDate,
                maxCursorDate,
                minCursorTimestamp,
                maxCursorTimestamp
            },
            () => {
                this._handleChange()
            }
        );
    },

    _getFirstDayTimestamp(year) {
        const date = new Date(year, 1, 1, 0, 0, 0, 0);
        return date.getTime() / 1000;
    },

    _getLastDayTimestamp(year) {
        const date = new Date(year, 12, 31, 0, 0, 0, 0);
        return date.getTime() / 1000;
    },

    _trasitionTo(year) {
        if( year < this.state.minCursorDate ) {
            //send minCursor to position
        }

        if( year > this.state.maxCursorDate ) {
            //send maxCursor to position
        }
    }
});

export default Timeline;

