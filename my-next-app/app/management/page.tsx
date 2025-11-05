'use client';
import React, { useState } from 'react';
import { Container, TextField, Button, Snackbar, Alert, Typography, Box, MenuItem, Select, InputLabel, FormControl, CircularProgress, Radio, RadioGroup, FormControlLabel, FormLabel, Checkbox, FormGroup } from '@mui/material';
import axios, { AxiosError } from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import config from '../config';

const CreateContestPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [type, setType] = useState('public');
  const [accessUser, setAccessUser] = useState<string[]>([]);
  const [taskOption, setTaskOption] = useState('random');
  const [taskDescription, setTaskDescription] = useState('');
  const [uploadImage, setUploadImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [contestImage, setContestImage] = useState<File | null>(null);
  const [alert, setAlert] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const isFormValid = () => {
    if (name && start && end && type) {
      if (type === 'private') {
        return accessUser.length > 0;
      }
      if (taskOption === 'custom' && (!taskDescription || (uploadImage && !contestImage))) {
        return false;
      }
      return true;
    }
    return false;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token'); // Assume the JWT token is stored in local storage
      const formData = new FormData();
      formData.append('name', name);
      formData.append('start', start);
      formData.append('end', end);
      formData.append('type', type);
      accessUser.forEach(user => formData.append('access_user[]', user)); // Append each user separately as array elements
      formData.append('taskOption', taskOption);
      formData.append('taskDescription', taskDescription);
      if (contestImage) formData.append('contestImage', contestImage);

      const response = await axios.post(
        `${config.API_BASE_URL}api/create_contest`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAlert({ open: true, message: response.data.message, severity: 'success' });
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>; // Define the expected error response type
      const errorMessage = axiosError.response?.data?.message || 'Failed to create contest';
      setAlert({ open: true, message: errorMessage, severity: 'error' });
    }
    finally{
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFile: React.Dispatch<React.SetStateAction<File | null>>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      if (e.target.files[0] && e.target.name === "contestImage") {
        setImagePreview(URL.createObjectURL(e.target.files[0]));
      }
    }
  };

  const handleCloseAlert = () => {
    setAlert(prevAlert => ({ ...prevAlert, open: false }));
  };

  return (
    <div>
      <Header />
      <Container>
        <Typography variant="h4" gutterBottom>Create Contest</Typography>
        <Box component="form" noValidate autoComplete="off" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Name" value={name} onChange={e => setName(e.target.value)} required />
          <TextField type="datetime-local" label="Start" InputLabelProps={{ shrink: true }} value={start} onChange={e => setStart(e.target.value)} required />
          <TextField type="datetime-local" label="End" InputLabelProps={{ shrink: true }} value={end} onChange={e => setEnd(e.target.value)} required />
          <FormControl required>
            <InputLabel>Type</InputLabel>
            <Select value={type} onChange={e => setType(e.target.value as string)}>
              <MenuItem value="public">Public</MenuItem>
              <MenuItem value="private">Private</MenuItem>
            </Select>
          </FormControl>
          {type === 'private' && (
            <TextField
              label="Access Users"
              value={accessUser.join(', ')}
              onChange={e => setAccessUser(e.target.value.split(',').map(user => user.trim()))}
              placeholder="Comma separated usernames"
            />
          )}
          <FormControl component="fieldset">
            <FormLabel component="legend">Task Option</FormLabel>
            <RadioGroup value={taskOption} onChange={e => setTaskOption(e.target.value)}>
              <FormControlLabel value="randomtask1" control={<Radio />} label="Random Task 1" />
              <FormControlLabel value="randomtask2" control={<Radio />} label="Random Task 2" />
              <FormControlLabel value="custom" control={<Radio />} label="Custom" />
            </RadioGroup>
          </FormControl>
          {taskOption === 'custom' && (
            <>
              <TextField
                label="Task Description"
                value={taskDescription}
                onChange={e => setTaskDescription(e.target.value)}
                required
                multiline
                rows={4}
              />
              <FormControlLabel
                    control={<Checkbox checked={uploadImage} onChange={e => setUploadImage(e.target.checked)} />}
                    label="Upload Contest Image"
                />
                {uploadImage && (
                    <>
                    <Button variant="contained" component="label">
                        Upload Image
                        <input name="contestImage" type="file" hidden onChange={e => handleFileChange(e, setContestImage)} />
                    </Button>
                    {imagePreview && (
                        <Box component="div" sx={{ marginTop: 2 }}>
                        <Typography variant="subtitle1">Image Preview:</Typography>
                        <img src={imagePreview} alt="Contest Preview" style={{ maxWidth: '100%', height: 'auto' }} />
                        </Box>
                    )}
                    </>
                )}
            </>
          )}
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={!isFormValid() || loading} // Disable button if form is invalid or while loading
          >
            {loading ? <CircularProgress size={24} /> : 'Create Contest'}
          </Button>
        </Box>
        <Snackbar open={alert.open} autoHideDuration={6000} onClose={handleCloseAlert}>
          <Alert onClose={handleCloseAlert} severity={alert.severity}>
            {alert.message}
          </Alert>
        </Snackbar>
      </Container>
      <Footer />
    </div>
  );
};

export default CreateContestPage;
