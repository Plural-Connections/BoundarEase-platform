import React, {useEffect} from "react";
import PerspectiveGettingStories from "./PerspectiveGettingStories";

import { ThemeProvider } from '@emotion/react'
import { theme, widthStyles } from './styles'

// import material UI components
import { Typography, Stack, Modal, Box, IconButton } from "@mui/material";

// import icons
import CloseIcon from '@mui/icons-material/Close';
import CustomModal from "./CustomModal";

const PerspectiveGettingPage = (props) => {
    const { stories } = props;

    // state variable to store full story
    const [expandedStory, setExpandedStory] = React.useState('')

    // state variable to determine whether or not to show full story
    const [showExpandedStory, setShowExpandedStory] = React.useState(false)
    const handleClose = () => setShowExpandedStory(false)

    useEffect(() => {
        // scroll to the top of the page
        window.scrollTo(0, 0);
    }, [])

    return (
        <ThemeProvider theme={theme}>
            <CustomModal open={showExpandedStory} handleClose={handleClose} content={
                <Typography sx={{ mt: 3 }}>
                "{expandedStory}"
            </Typography>
            } />
            <Stack
                direction="column"
                justifyContent="center"
                alignItems="flex-start"
                spacing={3}
                sx={{ width: { xs: '95%', sm: '90%', md: '90%', lg: '70%' } }}
            >
                <Typography variant="h2" sx={widthStyles}>
                    Great! Before you submit, here are some perspectives others have shared that we think are different from yours.
                </Typography>

                <PerspectiveGettingStories stories={stories} setExpandedStory={setExpandedStory} setShowExpandedStory={setShowExpandedStory} />

            </Stack>
        </ThemeProvider>
    )
}

export default PerspectiveGettingPage;