import React from "react";
import { ThemeProvider } from '@emotion/react'
import { theme } from './styles'

// import material UI components
import { List, ListItemIcon } from "@mui/material";
import { ListItem } from "@mui/material";
import { ListItemText } from "@mui/material";
import { Typography } from "@mui/material";
import { Stack } from "@mui/material";
import { FormControlLabel } from "@mui/material";
import { Checkbox } from "@mui/material";

import { Container, Draggable } from "react-smooth-dnd";

// import icons
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

const RankingQuestion = (props) => {

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
                <Typography variant="h2" sx={{paddingTop: 1}}>
                    Please rank the 4 Pillars in order of priority to you by dragging the cards below. 
                </Typography>
                <Typography variant="caption" sx={{fontWeight: '600', paddingBottom: 3}}>
                    If you give them equal importance, check the box at the bottom instead.
                </Typography>

                <Typography sx={{fontSize:'18px', fontStyle: 'italic'}} variant="body1">
                    Most important
                </Typography>

                <Stack
                    direction="column"
                    sx={{width:'100%'}}
                >
                    {/* Drag and drop part */}
                    <List sx={{ width:'90%'}}>
                        <Container lockAxis="y" onDrop={props.onDrop}>
                            {props.items.map((item, index) => (
                            <Draggable key={item.id}>
                                <ListItem divider={true} className="draggable-item" 
                                    sx={{bgcolor: '#D9D9D9', mb: index===3 ? 0 : 1,
                                        '&:hover': {
                                            cursor: 'pointer',   
                                        },
                                        }}
                                >
                                <ListItemIcon>
                                    <ListItemText sx={{fontSize:'18px'}} primary={index + 1} disableTypography />
                                </ListItemIcon>
                                <ListItemText sx={{fontSize:'18px'}} primary={item.name} secondary={item.desc}/>
                                <ListItemIcon>
                                    <DragIndicatorIcon />
                                </ListItemIcon>
                                </ListItem>
                            </Draggable>
                            ))}
                        </Container>
                    </List>
                </Stack>

                <Typography sx={{fontSize:'18px', fontStyle: 'italic'}} variant="body1">
                    Least important
                </Typography>   

            </Stack>

            <FormControlLabel sx={{
                '& .MuiFormControlLabel-label': {
                    fontWeight: '500'
                },
                marginTop: '-40px'
            }} 
            control={<Checkbox onChange={(e) =>{
                if(e.target.checked) {
                    props.setRankEqual(true)
                } else {
                    props.setRankEqual(false)
                }
            }}/>} 
            label="I give all 4 Pillars equal importance." 
            />

        </ThemeProvider>
    )
}

export default RankingQuestion;
