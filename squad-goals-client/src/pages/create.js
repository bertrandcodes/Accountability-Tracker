import React, { Component, Fragment } from 'react';
//Material UI
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import withStyles from '@material-ui/core/styles/withStyles';
import Avatar from '@material-ui/core/Avatar';
import Checkbox from '@material-ui/core/Checkbox';
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';
//Redux
import { connect } from 'react-redux';
import { addChallenge } from '../redux/actions/userActions';
import PropTypes from 'prop-types';

const styles = theme => ({
    mainDiv: {
        display: 'flex',
        flexDirection: 'column',
        marginLeft: 'auto',
        marginRight: 'auto',
        textAlign: 'center',
    },
    secondDiv: {
        position: 'relative',
        textAlign: 'center',
        width: '320px',
        marginLeft: 'auto',
        marginRight: 'auto',
        boxSizing: 'border-box',
        paddingTop: '10px',
        paddingBottom: '25px',
        backgroundColor: 'white',
    },
    backgroundDiv: {
        position: 'absolute',
        left: '0',
        right: '0',
        marginLeft: 'auto',
        marginRight: 'auto',
        height: '340px',
        width: '320px',
        border: '3px double grey',
        borderRadius: '15px',
        bottom: '215px'
    },
    challengeHeader: {
        marginTop: '0px',
        marginBottom: '10px',
    },
    form: {
        width: '280px',
        margin: 'auto'
    },
    textField: {
        marginTop: '5px',
    },
    challengeButton: {
        margin: 'auto',
        width: '125px',
        marginBottom: '15px'
    },
    addChallengersDiv: {
        margin: 'auto',
        marginTop: '10px',
        width: '290px',
        marginBottom: '15px',
        padding: '12px',
        boxSizing: 'border-block',
        border: '3px double grey',
        borderRadius: '15px',
        overflowX: 'hidden',
        overflowY: 'scroll',
        textAlign: 'center',
        maxHeight: '135px'
    },
    noFriends: {
        margin: 'auto'
    },
    addParticipants: {
        textAlign: 'center',
    },
    header: {
        marginTop: '10px',
        marginBottom: '0px'
    },
    friendRender: {
        height: '50px',
        position: 'relative',
        textAlign: 'left'
    },
    friendHandle: {
        marginTop: '-30px',
        paddingLeft: '60px',
    },
    check: {
        color: 'green',
        position: 'absolute',
        right: '0px',
        bottom: '6px',
    },
    customError: {
        color: 'red',
        fontSize: '0.8rem',
        marginTop: 10
    },
    progress: {
        position: 'absolute',
        top: '3px',
        left: '48px',
    }
});

export class create extends Component {
    constructor() {
        super();
        this.state = {
            name: '',
            goal: '',
            description: '',
            participants: {},
            participantList: [],
            errors: {}
        }
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.UI.errors) {
            this.setState({ errors: nextProps.UI.errors });
        }
    };
    handleChange = (event) => {
        this.setState({
            [event.target.name]: event.target.value,
        });
    };
    addParticipant = (friendData) => {
        const { handle, uid, imageUrl, current, completed, lastUpdate, total } = friendData;
        this.state.participants[uid] = { handle, current, imageUrl, completed, lastUpdate, total };
        this.setState({
            participantList: [...this.state.participantList, handle]
        })
    }
    handleSubmit = (ownData) => {
        const { handle, uid, imageUrl, current, completed, lastUpdate, total } = ownData;
        this.state.participants[uid] = { handle, current, imageUrl, completed, lastUpdate, total };
        const userDetails = {
            name: this.state.name,
            goal: this.state.goal,
            description: this.state.description,
            participants: this.state.participants,
            participantList: [...this.state.participantList, handle],
        };
        this.props.addChallenge(userDetails, this.props.history);
    }

    render() {
        const { handle, userId, imageUrl } = this.props.credentials;
        const { classes, UI: { loading } } = this.props;
        const { friends } = this.props.user;
        const { errors } = this.state;

        var ownData = {
            handle,
            uid: userId,
            imageUrl: imageUrl,
            current: 0,
            completed: 0,
            lastUpdate: 'N/A',
            total: 0,
        }

        return (
            <Fragment>
                <div className={classes.mainDiv}>
                    <Paper className={classes.secondDiv}>
                        <h1 className={classes.challengeHeader}><span className={classes.challengeSpan}>Start new challenge:</span></h1>

                        <Grid container direction={"column"} className={classes.form} spacing={1}>
                            <form noValidate>
                                <Grid item>

                                    <TextField
                                        className={classes.textField}
                                        name="name"
                                        type="name"
                                        label="Challenge name"
                                        rows="1"
                                        placeholder="Pushups"
                                        variant="outlined"
                                        value={this.state.name}
                                        onChange={this.handleChange}
                                        fullWidth
                                        helperText={errors.name}
                                        error={errors.name}
                                    >
                                    </TextField>
                                </Grid>
                                <Grid item>
                                    <TextField
                                        className={classes.textField}
                                        name="goal"
                                        type="goal"
                                        label="Goal"
                                        rows="1"
                                        placeholder="100"
                                        variant="outlined"
                                        value={this.state.goal}
                                        onChange={this.handleChange}
                                        fullWidth
                                        helperText={errors.goal}
                                        error={errors.goal}
                                    >
                                    </TextField>
                                </Grid>
                                <Grid item>
                                    <TextField
                                        className={classes.textField}
                                        name="description"
                                        type="description"
                                        label="Description"
                                        rows="1"
                                        placeholder="Do 100 pushups everyday!"
                                        variant="outlined"
                                        value={this.state.description}
                                        onChange={this.handleChange}
                                        fullWidth
                                        helperText={errors.description}
                                        error={errors.description}
                                    >
                                    </TextField>
                                </Grid>
                            </form>
                        </Grid>
                    </Paper>

                    <div className={classes.addParticipants}>
                        <h2 className={classes.header}>Add participants</h2>
                        <div className={classes.addChallengersDiv}>
                            {friends.length > 0 ?
                                (friends ? (friends.map(friend => {
                                    const friendData = {
                                        handle: friend.handle,
                                        uid: friend.userId,
                                        imageUrl: friend.imageUrl,
                                        current: 0,
                                        completed: 0,
                                        lastUpdate: 'N/A',
                                        total: 0
                                    }
                                    return <div key={friend.userId} className={classes.friendRender}>
                                        <Avatar alt={friend.handle} src={friend.imageUrl} ></Avatar>
                                        <div className={classes.friendHandle}>{friend.handle}
                                            <Checkbox
                                                onClick={event => { event.preventDefault(); this.addParticipant(friendData) }}
                                                color='green'
                                                className={classes.check}
                                            /></div>
                                    </div>
                                }
                                )) : <p>Loading...</p>) : (<p className={classes.noFriends}>No friends yet... <span role="img" aria-label="sad">&#128546;</span></p>)
                            }
                        </div>
                    </div>

                    <Button className={classes.challengeButton} onClick={event => { event.preventDefault(); this.handleSubmit(ownData) }} type="submit" variant="contained" color="secondary" disabled={loading}>
                        Create
                        {loading && (
                            <CircularProgress size={30} className={classes.progress} />
                        )}
                    </Button>
                </div>


            </Fragment>
        )
    }
}

create.propTypes = {
    addChallenge: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired
};

const mapStateToProps = (state) => ({
    credentials: state.user.credentials,
    user: state.user,
    UI: state.UI
});

export default connect(
    mapStateToProps,
    { addChallenge }
)(withStyles(styles)(create));

