import React, { useState, useEffect, useCallback } from 'react';
import Handsontable from 'handsontable';
import { HotTable } from '@handsontable/react';
import 'handsontable/dist/handsontable.full.css';
import axios from 'axios';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import theme from '../../../theme/theme';
import { HTTP } from '../../../server/axios';
import { Box, Container, Grid, IconButton } from '@mui/material';

const HandsontableComponent = () => {
    const [data, setData] = useState([]);
    const apiUrl = '/employee'; // Replace with your API URL

    useEffect(() => {
        // GET request to fetch initial data
        HTTP.get(apiUrl)
            .then(response => setData(response.data))
            .catch(error => console.error('Error fetching data:', error));
    }, [apiUrl]);

    const handleAddRow = () => {
        const newRow = Array(data[0]?.length || 1).fill('');
        const newData = [...data, newRow];
        setData(newData);

        // POST request to add the new row
        HTTP.post(apiUrl, newRow)
            .then(response => {
                const addedRow = response.data;
                const updatedData = newData.map((row, index) => (index === newData.length - 1 ? addedRow : row));
                setData(updatedData);
            })
            .catch(error => console.error('Error adding row:', error));
    };

    const handleRemoveRow = () => {
        const newData = data.slice(0, -1);
        const idToRemove = data[data.length - 1]?.id; // Assuming each row has an 'id'

        if (idToRemove) {
            HTTP.delete(`${apiUrl}/${idToRemove}`)
                .then(() => setData(newData))
                .catch(error => console.error('Error deleting row:', error));
        } else {
            setData(newData);
        }
    };

    const handleDataChange = useCallback(
        (changes, source) => {
            if (source === 'loadData' || !changes) return; // Don't save this change if data is loading or changes is null

            const newData = [...data];
            changes.forEach(([row, prop, oldValue, newValue]) => {
                newData[row][prop] = newValue;
                const updatedRow = newData[row];
                const idToUpdate = updatedRow.id; // Assuming each row has an 'id'

                HTTP.put(`${apiUrl}/${idToUpdate}`, updatedRow)
                    .then(response => {
                        const updatedRow = response.data;
                        const updatedData = newData.map((r, i) => (i === row ? updatedRow : r));
                        setData(updatedData);
                    })
                    .catch(error => console.error('Error updating row:', error));
            });
        },
        [data, apiUrl]
    );

    console.log('Data:', data);

    return (
        <Container maxWidth="xl" sx={{ p: 5 }}>
            <Grid container spacing={2}>
                <Grid item size={12}>
                    <Box sx={{ flexGrow: 1, p: 5, width: '100%' }}>
                        <HotTable
                            data={data}
                            licenseKey="non-commercial-and-evaluation"
                            preventOverflow="horizontal"
                            colHeaders={['รหัสพนักงาน', 'ชื่อพนักงาน', 'ประกันสังคม', 'ภาษี', 'หัก ณ ที่จ่าย']}
                            autoWrapRow={true}
                            autoWrapCol={true}
                            wordWrap={true}
                            autoRowSize={true}
                            width="100%"
                            stretchH="all"
                            contextMenu={true}
                            rowHeaders={true}
                            columnHeaderHeight={30}
                            manualColumnMove={true}
                            columns={[
                                { data: 'EmployeeID' },
                                {
                                    data: 'Name',
                                    renderer: function (instance, td, row, col, prop, value, cellProperties) {
                                        const name = instance.getDataAtRowProp(row, 'Name') || '';
                                        const lastname = instance.getDataAtRowProp(row, 'Lastname') || '';
                                        td.innerHTML = `${name} ${lastname}`;
                                        return td;
                                    }
                                },
                                { data: 'socialSecurity' },
                                { data: 'Vat' },
                                { data: 'Cost' },
                            ]}
                            afterGetRowHeader={(row, TH) => {
                                TH.style.background = theme.palette.primary.main;
                                TH.style.color = theme.palette.primary.contrastText;
                                TH.style.fontWeight = 'bold';
                            }}
                            afterGetColHeader={(row, TH) => {
                                TH.style.background = theme.palette.primary.main;
                                TH.style.color = theme.palette.primary.contrastText;
                                TH.style.fontWeight = 'bold';
                            }}
                            afterChange={handleDataChange}
                        />

                        <IconButton variant="contained" color="info" onClick={handleAddRow}>
                            <AddCircleOutlineIcon />
                        </IconButton>
                        <IconButton variant="contained" color="error" onClick={handleRemoveRow}>
                            <RemoveCircleOutlineIcon />
                        </IconButton>
                    </Box>
                </Grid>
            </Grid>
        </Container>
    );
};

export default HandsontableComponent;
