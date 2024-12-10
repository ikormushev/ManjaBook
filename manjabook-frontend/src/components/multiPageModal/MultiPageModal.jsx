import CustomModal from "../../utils/modal/CustomModal.jsx";
import {Box, Tab, Tabs} from "@mui/material";
import {Children, useState} from "react";

export default function MultiPageModal({isOpen, onClose, pagesLabels, children}) {
    const [activeTab, setActiveTab] = useState(0);
    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };
    const childrenArray = Children.toArray(children);

    return (<CustomModal isOpen={isOpen} onClose={onClose}>
        <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="modal tabs"
            variant="fullWidth"
        >

            {pagesLabels.map((label, index) => {
                return <Tab label={`${index + 1}. ${label}`} key={`${index}-${label}`} />
            })}
        </Tabs>

        <Box sx={{ mt:2 }}>
            {childrenArray[activeTab]}
        </Box>
    </CustomModal>)
};