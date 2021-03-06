import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Loading from './Loading';
//Material UI
import Button from '@material-ui/core/Button';
import withStyles from '@material-ui/core/styles/withStyles';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import AddAPhotoIcon from '@material-ui/icons/AddAPhoto';
//Redux
import { connect } from 'react-redux';
import { logoutUser, uploadImage } from '../redux/actions/userActions';
import PropTypes from 'prop-types';

const styles = {
    paper: {
        backgroundColor: '#ffffff',
        color: 'black',
        height: '385px',
        width: '280px',
        position: 'relative',
        textAlign: 'center',
        padding: '10px',
        borderRadius: '60%'
    },
    profileImage: {
        width: '230px',
        height: '230px',
        marginTop: '10%',
        objectFit: 'cover',
        borderRadius: '50%',
        maxWidth: '100%',
        maxHeight: '100%'
    },
    imageWrapper: {
        marginTop: '-10px',
        marginRight: '20px',
        marginLeft: '20px',
        marginBottom: '20px',
    },
    camera: {
        color: 'grey',
        position: 'absolute',
        left: '200px',
        bottom: '145px',
    },
    cameraFrame: {
        height: '50px',
        width: '50px',
        backgroundColor: 'white',
        borderRadius: '50%',
        textAlign: 'center',
    },
    noAccount: {
        height: '90px',
        width: '250px',
        paddingTop: '20px',
        textAlign: 'center'
    },
    noButton: {
        margin: '10px'
    }
};

export class Profile extends Component {
    handleImageChange = (event) => {
        const image = event.target.files[0];
        const formData = new FormData();
        console.log(image, 'image')
        formData.append('image', image, image.name);
        this.props.uploadImage(formData);
    }
    handleEditPicture = () => {
        const fileInput = document.getElementById('imageInput');
        fileInput.click();
    }
    render() {
        const { classes, user: { credentials: { completed, handle, imageUrl }, loading, authenticated } } = this.props;

        let profileMarkup = !loading ? (authenticated ? (
            <Paper className={classes.paper}>
                <div className={classes.imageWrapper}><img src={imageUrl} alt="profile pic" className={classes.profileImage} />
                    <input type="file" id="imageInput" hidden="hidden" onChange={this.handleImageChange} />
                    <Tooltip title="Edit profile picture" placement="top" className={classes.camera}>
                        <div className={classes.cameraFrame}>
                            <IconButton onClick={this.handleEditPicture}>
                                <AddAPhotoIcon />
                            </IconButton>
                        </div>
                    </Tooltip>
                </div>
                <Typography variant="h3" align="center">{handle}</Typography>

                <Typography variant="h5" align="center"> <span role="img" aria-label="fire">&#128293;</span> Streaks: {completed}</Typography>
            </Paper>
        ) : (<Paper className={classes.noAccount}><Typography variant="body2" align="center">No Profile found, please login again</Typography>
            <div className={classes.buttons}>
                <Button variant="contained" color="primary" className={classes.noButton} component={Link} to="/login">Login</Button>
                <Button variant="contained" color="secondary" className={classes.noButton} component={Link} to="/signup">Sign Up</Button>
            </div>
        </Paper>)) : (<Loading />)
        return profileMarkup;
    }
}

const mapStateToProps = (state) => ({
    user: state.user
});

const mapActionsToProps = { logoutUser, uploadImage }

Profile.propTypes = {
    uploadImage: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired
}

export default connect(mapStateToProps, mapActionsToProps)(withStyles(styles)(Profile))
