import * as React from 'react';
import { ThemeProvider } from '@emotion/react'
import { theme } from './styles'
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { Stack } from "@mui/material";
import LocationOnIcon from '@mui/icons-material/LocationOn';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import parse from 'autosuggest-highlight/parse';
import { debounce } from '@mui/material/utils';
import { InputAdornment } from '@mui/material';

function loadScript(src, position, id) {
  if (!position) {
    return;
  }

  const script = document.createElement('script');
  script.setAttribute('async', '');
  script.setAttribute('id', id);
  script.src = src;
  position.appendChild(script);
}

const autocompleteService = { current: null };

const AddressQuestion = (props) => {
  const { mapsAPIKey } = props

  const [value, setValue] = React.useState(null);
  const [inputValue, setInputValue] = React.useState('');
  const [options, setOptions] = React.useState([]);
  const loaded = React.useRef(false);

  if (typeof window !== 'undefined' && !loaded.current && (typeof mapsAPIKey === 'string' || mapsAPIKey instanceof String) ) {
    if (!document.querySelector('#google-maps')) {
      loadScript(
        `https://maps.googleapis.com/maps/api/js?key=${mapsAPIKey}&libraries=places`,
        document.querySelector('head'),
        'google-maps',
      );
    }

    loaded.current = true;
  }

  const fetch = React.useMemo(
    () =>
      debounce((request, callback) => {
        autocompleteService.current.getPlacePredictions(request, callback);
      }, 400),
    [],
  );

  React.useEffect(() => {
    let active = true;

    if (!autocompleteService.current && window.google) {
      autocompleteService.current =
        new window.google.maps.places.AutocompleteService();
    }
    if (!autocompleteService.current) {
      return undefined;
    }

    if (inputValue === '') {
      setOptions(value ? [value] : []);
      return undefined;
    }

    fetch({ input: inputValue }, (results) => {
      if (active) {
        let newOptions = [];

        if (value) {
          newOptions = [value];
        }

        if (results) {
          newOptions = [...newOptions, ...results];
        }

        setOptions(newOptions);
      }
    });

    return () => {
      active = false;
    };
  }, [value, inputValue, fetch]);

  return (
    <ThemeProvider theme={theme}>
            <Stack
                direction="column"
                justifyContent="center"
                alignItems="flex-start"
                spacing={1}
                sx={{width: {xs: '95%', sm: '90%', md: '80%'}}}
            >
                {/* Question text */}
                <Typography variant="h2" sx={{paddingBottom: 1}}>
                    Please enter your address to see personalized stats for these boundaries.
                </Typography>

                <Autocomplete
                  id="google-map-demo"
                  sx={{ width: {xs: '90%', md: 500} }}
                  getOptionLabel={(option) =>
                    typeof option === 'string' ? option : option.description
                  }
                  filterOptions={(x) => x}
                  options={options}
                  autoComplete
                  includeInputInList
                  filterSelectedOptions
                  value={value}
                  noOptionsText="No locations found"
                  onChange={(event, newValue) => {
                    if(newValue != null) {
                      props.setAddress(newValue.description)

                      // enable the Next button on Start Page
                      props.setDisableButton(false)
                    } else {
                      props.setAddress('')

                      // disable the Next button on Start Page if user cleared address
                      props.setDisableButton(true)
                    }
                    setOptions(newValue ? [newValue, ...options] : options);
                    setValue(newValue);
                  }}
                  onInputChange={(event, newInputValue) => {
                    setInputValue(newInputValue);
                  }}
                  renderInput={(params) => (
                    <TextField 
                        {...params} 
                        label="Search here" 
                        fullWidth 
                        InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                                <InputAdornment position="start">
                                    <LocationOnIcon sx={{ color: 'text.secondary' }} />
                                </InputAdornment>
                            )
                        }}
                    />
                  )}
                  renderOption={(props, option) => {
                    const matches =
                      option.structured_formatting.main_text_matched_substrings || [];

                    const parts = parse(
                      option.structured_formatting.main_text,
                      matches.map((match) => [match.offset, match.offset + match.length]),
                    );

                    return (
                      <li {...props}>
                        <Grid container alignItems="center">
                          <Grid item sx={{ display: 'flex', width: 44 }}>
                            <LocationOnIcon sx={{ color: 'text.secondary' }} />
                          </Grid>
                          <Grid item sx={{ width: 'calc(100% - 44px)', wordWrap: 'break-word' }}>
                            {parts.map((part, index) => (
                              <Box
                                key={index}
                                component="span"
                                sx={{ fontWeight: part.highlight ? 'bold' : 'regular' }}
                              >
                                {part.text}
                              </Box>
                            ))}

                            <Typography variant="body2" color="text.secondary">
                              {option.structured_formatting.secondary_text}
                            </Typography>
                          </Grid>
                        </Grid>
                      </li>
                    );
                  }}
                />
            </Stack>
        </ThemeProvider>

    
  );
}

export default AddressQuestion;