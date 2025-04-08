import React from "react";

// import icons
import FaceIcon from '@mui/icons-material/Face';
import Face3Icon from '@mui/icons-material/Face3';
import Face6Icon from '@mui/icons-material/Face6';

// import material UI components
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { Button, CardActions } from "@mui/material";

const PerspectiveGettingStories = (props) => {

    const stories = props.stories;

    // if there are multiple stories to render, cycle through 3 colors and 3 avatars
    const avatar = (num) => {
        const blue = "#8ECAE6"
        const yellow = "#FFB703"
        const orange = "#FB8500"

        if (num === 0) {
            return <Avatar sx={{ bgcolor: orange }}>
                <FaceIcon />
            </Avatar>
        } else if (num === 1) {
            return <Avatar sx={{ bgcolor: yellow }}>
                <Face3Icon />
            </Avatar>
        } else if (num === 2) {
            return <Avatar sx={{ bgcolor: blue }}>
                <Face6Icon />
            </Avatar>
        }
    }

    // renders one story, defaults to only display quote
    // will dispaly full story if user clicks "Read More"
    const renderStory = (num, story) => {
        return (
            <Stack key={num} direction="row" spacing={1} alignItems="flex-end" sx={{ marginBottom: "15px" }}>
                {avatar(num)}
                <Card sx={{ width: { xs: "75%", sm: "500px" } }}>
                    <CardContent>
                        <Typography variant="h6" color="text.secondary" sx={{mt: 1}}>
                            "{story.story_quote}"
                        </Typography>
                    </CardContent>
                    <CardActions>
                        <Button size='small' onClick={() => {
                            props.setExpandedStory(story.story_text)
                            props.setShowExpandedStory(true)
                        }}>
                            Read More
                        </Button>
                    </CardActions>
                </Card>
            </Stack>
        )
    }

    // renders all stories passed from props
    const renderStories = () => {
        let renderedStories = [];
        let num = 0;

        // iterate through stories array, num for rendering an avatar
        for (let i = 0; i < stories.length; i++) {
            renderedStories.push(renderStory(num, stories[i]))
            num += 1
            num = num % 3
        }

        return renderedStories
    }

    return (
        renderStories()
    )
}

export default PerspectiveGettingStories;