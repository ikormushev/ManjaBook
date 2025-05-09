import CustomModal from "../../utils/customModal/CustomModal.jsx";
import {Box, Tab, Tabs} from "@mui/material";
import {Children} from "react";

export default function MultiPageModal({isOpen, onClose, pagesLabels, activeTab, handleTabChange,children}) {
    const childrenArray = Children.toArray(children);

    return (
        <CustomModal isOpen={isOpen} onClose={onClose}>
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    aria-label="modal tabs"
                    variant="fullWidth"
                >

                    {pagesLabels.map((label, index) => {
                        return <Tab label={`${index + 1}. ${label}`} key={`${index}-${label}`}/>
                    })}
                </Tabs>

                <Box sx={{mt: 2}}>
                    {childrenArray[activeTab]}
                </Box>
        </CustomModal>
    )
};
