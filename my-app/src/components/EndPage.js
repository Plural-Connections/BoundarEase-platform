import React from "react";
import { ThemeProvider } from '@emotion/react'
import { theme, widthStyles } from './styles'

// import material UI components
import { Typography } from "@mui/material";
import { Stack } from "@mui/material"

const EndPage = (props) => {
    return (
        <ThemeProvider theme={theme}>
            <Stack
                direction="column"
                justifyContent="center"
                alignItems="center"
                spacing={5}
                sx={{ width: '100vw', height: '100vh'
                    }}
            >

                <Typography variant="h2" sx={widthStyles}>
                    Thank you! We appreciate you taking the time to send us your thoughts.
                </Typography>

            </Stack>
        </ThemeProvider>
    )
}

export default EndPage;