import { Backdrop, Snackbar, CircularProgress, Button, FormControl, FormControlLabel, Input, InputAdornment, InputLabel, MenuItem, Modal, Select, Switch, TextField } from "@material-ui/core"
import {Alert} from '@material-ui/lab'
import * as Icons from '@material-ui/icons'
import { useEffect, useState } from "react"
import styled from 'styled-components'
import { ToBase64 } from "../Utils"
import OverlayLoadingDialog from "./OverlayLoadingDialog"
import Firebase from 'firebase'
import { AddItemToInventory, UpdateInventoryItem } from "../Database/Database"


function AddItemDialog(props){
    // dropdowns
    const [selectedCategory, setSelectedCategory] = useState('SelectCategory')
    const [selectedUnit, setSelectedUnit] = useState({})
    const [selectedGst, setSelectedGst] = useState('SelectGST')
    // low stock
    const [lowStockEnabled, setLowStockEnabled] = useState(false)
    const [lowStockText, setLowStockText] = useState()
    // tax inclusive
    const [taxInclusive, setTaxInclusive] = useState(false)
    // text variables
    const [itemName, setItemName] = useState('')
    const [itemCode, setItemCode] = useState('')
    const [itemDescription, setItemDescription] = useState('')
    const [itemOpeningStock, setItemOpeningStock] = useState('')
    const [itemRate, setItemRate] = useState('')
    // images
    const [images, setImages] = useState([])
    // snackbar
    const [showSnack, setShowSnack] = useState('')
    const [snackSeverity, setSnackSeverity] = useState('success')
    // loading
    const [loadingText, setLoadingText] = useState(null)

    const CloseDialog = () => {
        const datePicker = document.getElementById('add_item_date_picker')
        
        setSelectedCategory('SelectCategory')
        setSelectedUnit({})
        setSelectedGst('SelectGST')
        setLowStockEnabled(false)
        setLowStockText()
        setTaxInclusive(false)
        setItemName('')
        setItemCode('')
        setItemDescription('')
        setItemOpeningStock('')
        setItemRate('')
        setImages([])
        datePicker.valueAsDate = null
        props.onClose()
    }

    const SelectFileClicked = () => {
        if(images.length > 5){
            setSnackSeverity('error')
            setShowSnack('Cannot select more than 5 files')
        }
        const input = document.getElementById('FileSelector')
        input.click()
    }

    const OnFileSelected = async (files) => {
        if(files.length + images.length > 5){
            setSnackSeverity('error')
            setShowSnack('Cannot select more than 5 files')
            return;
        }
        const baseCodes = []
        for(let i = 0; i < files.length; i++){
            baseCodes.push(await ToBase64(files[i]))
        }
        setImages([...images, ...baseCodes])
    }

    const RemoveImageAtIndex = (index) => {
        setImages(images.filter((val, i) => i !== index))
    }

    const SavePressed = () => {
        const datePicker = document.getElementById('add_item_date_picker')
        // checking if all good
        if(itemName.trim().length === 0){
            setSnackSeverity('error')
            setShowSnack('Please enter Item Name')
            return
        }
        if(!selectedCategory || selectedCategory === 'SelectCategory'){
            setSnackSeverity('error')
            setShowSnack('Please select Item Category')
            return
        }
        if(Object.keys(selectedUnit).length === 0){
            setSnackSeverity('error')
            setShowSnack('Please  select Item Unit')
            return
        }
        if(props.editItem === null && itemOpeningStock.trim().length === 0){
            setSnackSeverity('error')
            setShowSnack('Please enter Item opening stock')
            return
        }
        if(!datePicker.valueAsDate){
            setSnackSeverity('error')
            setShowSnack('Please  select Date')
            return
        }
        if(lowStockEnabled && itemRate.trim().length === 0){
            setSnackSeverity('error')
            setShowSnack('Please enter Low Stock value')
            return
        }
        if(itemRate.trim().length === 0){
            setSnackSeverity('error')
            setShowSnack('Please enter Item purchase Price')
            return
        }
        if(selectedGst !== 0 && (!selectedGst || selectedGst === 'SelectGST')){
            setSnackSeverity('error')
            setShowSnack('Please select GST Rate')
            return
        }

        const dataToSave = {
            category: selectedCategory,
            code: itemCode,
            date: Firebase.firestore.Timestamp.fromDate(datePicker.valueAsDate),
            description: itemDescription,
            gstIncluded: taxInclusive,
            gstPercent: parseInt(selectedGst),
            images: images,
            lowStockWarning: lowStockEnabled ? parseInt(lowStockText) : null,
            name: itemName,
            price: parseInt(itemRate),
            stock: parseInt(itemOpeningStock),
            unit: selectedUnit.symbol
        }

        if(props.editItem === null){
            setLoadingText('Adding Item to Inventory')
            AddItemToInventory(dataToSave)
                .then(() => {
                    CloseDialog()
                })
                .catch(err => {
                    console.log('Error adding item', err)
                    setSnackSeverity('error')
                    setShowSnack('Error adding item at the moment')
                })
                .finally(() => setLoadingText(null))
        }else{
            setLoadingText('Saving changes in this Item')
            delete dataToSave.stock
            UpdateInventoryItem(props.editItem.docId, dataToSave)
                .then(() => {
                    CloseDialog()
                })
                .catch(err => {
                    console.log('Error adding item', err)
                    setSnackSeverity('error')
                    setShowSnack('Error adding item at the moment')
                })
                .finally(() => setLoadingText(null))
        }

        
    }

    useEffect(() => {
        if(props.editItem === null) return

        const datePicker = document.getElementById('add_item_date_picker')
        
        setSelectedCategory(props.editItem.category)
        setSelectedUnit(props.units.filter(item => item.symbol === props.editItem.unit)[0])
        setSelectedGst(props.editItem.gstPercent)
        setLowStockEnabled(props.editItem.lowStockWarning !== null)
        setLowStockText(props.editItem.lowStockWarning)
        setTaxInclusive(props.editItem.gstIncluded)
        setItemName(props.editItem.name)
        setItemCode(props.editItem.code)
        setItemDescription(props.editItem.description)
        setItemOpeningStock(props.editItem.stock)
        setItemRate(props.editItem.price + '')
        setImages(props.editItem.images)
        datePicker.valueAsDate = props.editItem.date.toDate()
    }, [props.editItem])

    return(
        <Backdrop
            style={{zIndex: 10}}
            open={props.open}
            onClose={props.onClose}>
                <input 
                    id="FileSelector" 
                    type="file" 
                    multiple 
                    style={{display: "none"}}
                    accept="image/*"
                    onChange={ev => OnFileSelected(ev.target.files)}/>

                <MainContainer>
                    <Heading>{props.editItem !== null ? "Edit Item" : "Add Item"}</Heading>
                    
                    <Body>
                        <InnerBody>
                            <h3>General Details</h3>
                            
                            <ImageSelectContainer>
                                <span onClick={SelectFileClicked}>
                                    <Icons.CloudUpload
                                        fontSize="large"
                                        htmlColor="#9e9e9e"
                                        />
                                    <h4 style={{margin: 0}}>Click to select upto 5 Images</h4>
                                </span>
                                
                                <ImageContainer>
                                    {images.map((item, index) => {
                                        return(
                                            <ImageWrapper>
                                                <Image src={item} />
                                                <Icons.Close
                                                    onClick={() => RemoveImageAtIndex(index)}
                                                    style={{position: "absolute", top: "5px", right: "5px"}}
                                                    color="secondary"
                                                    fontSize="small" />
                                            </ImageWrapper>
                                        )
                                    })}
                                </ImageContainer>
                            </ImageSelectContainer>
                            <br />

                            <TextField 
                                style={{width: "100%"}}
                                label="Item Name" 
                                variant="outlined"
                                value={itemName}
                                onChange={ev => setItemName(ev.target.value)}/>
                            <br />
                            <FormControl
                                style={{width: "100%"}}>
                                <Select
                                    variant="outlined"
                                    value={selectedCategory}
                                    onChange={ev => setSelectedCategory(ev.target.value)}
                                    >
                                    <MenuItem value={"SelectCategory"}>Select Category</MenuItem>
                                    {props.categories.map(item => <MenuItem value={item}>{item}</MenuItem>)}
                                </Select>
                            </FormControl>

                            <br />
                            <TextField 
                                style={{width: "100%"}}
                                label="Item Code" 
                                variant="outlined"
                                value={itemCode}
                                onChange={ev => setItemCode(ev.target.value)} />
                            <br />
                            <TextField 
                                style={{width: "100%"}}
                                label="Item Description" 
                                multiline
                                variant="outlined"
                                value={itemDescription}
                                onChange={ev => setItemDescription(ev.target.value)} />
                            
                        </InnerBody>

                        {/* Second segment */}
                        <InnerBody>
                            <h3>Stock Details</h3>

                            <DualField>
                                <FormControl
                                    style={{width: "48%"}}>
                                    <Select
                                        variant="outlined"
                                        value={selectedUnit.label ?? 'SelectUnit'}
                                        onChange={ev => setSelectedUnit(props.units.filter(item => item.label === ev.target.value)[0])}
                                        >
                                        <MenuItem value={"SelectUnit"}>Select Unit</MenuItem>
                                        {props.units.map(item => <MenuItem value={item.label}>{item.label}</MenuItem>)}
                                    </Select>
                                </FormControl>

                                {props.editItem === null && 
                                <TextField
                                    style={{width: "48%"}}
                                    label="Opening Stock" 
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">{selectedUnit ? selectedUnit.symbol : ""}</InputAdornment>,
                                    }}
                                    type="number"
                                    variant="outlined"
                                    value={itemOpeningStock}
                                    onChange={ev => setItemOpeningStock(ev.target.value)} />}
                            </DualField>
                            <br/>

                            <TextField
                                id="add_item_date_picker"
                                style={{width: "100%"}}
                                type="date"
                                label="As of Date"
                                variant="outlined"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                            <br />

                            <DualField>
                                <FormControlLabel
                                    style={{width: "48%"}}
                                    control={<Switch checked={lowStockEnabled} 
                                    onChange={ev => setLowStockEnabled(ev.target.checked)} color="primary" />}
                                    label="Low Stock Warning"
                                />

                                {lowStockEnabled && 
                                <TextField
                                    style={{width: "48%"}}
                                    label="Low Stock Units" 
                                    value={lowStockText}
                                    type="number"
                                    onChange={ev => setLowStockText(ev.target.value)}
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">{selectedUnit ? selectedUnit.symbol : ""}</InputAdornment>,
                                    }}
                                    variant="outlined" />}
                            </DualField>
                            <br />

                            <h3>Pricing Details</h3>
                            <DualField>
                                <TextField
                                    style={{width: "48%"}}
                                    label="Purchase Price" 
                                    type="number"
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                    }}
                                    variant="outlined"
                                    value={itemRate}
                                    onChange={ev => setItemRate(ev.target.value)} />

                                <FormControlLabel
                                    style={{width: "48%"}}
                                    control={<Switch checked={taxInclusive} onChange={ev => setTaxInclusive(ev.target.checked)} color="primary" />}
                                    label="Inclusive of TAX"
                                />
                            </DualField>
                            <br />

                            <FormControl
                                    style={{width: "100%"}}>
                                    <Select
                                        variant="outlined"
                                        labelId="select_gst_label"
                                        value={selectedGst}
                                        onChange={ev => setSelectedGst(ev.target.value)}
                                        defaultValue={"SelectGST"}
                                        >
                                        <MenuItem value="SelectGST">Select GST Rate</MenuItem>
                                        {props.gst.map(item => <MenuItem value={item}>GST@ {item} %</MenuItem>)}
                                    </Select>
                                </FormControl>

                        </InnerBody>
                    </Body>

                    <ActionContainer>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={SavePressed}>
                                SAVE
                        </Button>
                        <Button
                            style={{marginLeft: "0.8em"}}
                            variant="outlined"
                            color="secondary"
                            onClick={() => CloseDialog()}>
                                DISCARD
                        </Button>
                    </ActionContainer>

                    <Snackbar anchorOrigin={{vertical: "top", horizontal: "center"}} open={showSnack.length > 0} autoHideDuration={3000} onClose={() => setShowSnack('')}>
                        <Alert onClose={() => setShowSnack('')} severity={snackSeverity}>
                            {showSnack}
                        </Alert>
                    </Snackbar>
                    <OverlayLoadingDialog open={loadingText !== null} text={loadingText} />
                </MainContainer>
        </Backdrop>
    )
}

const MainContainer = styled.div`
    width: calc(100% - 1em);
    margin: 0 1em;
    height: 90%;
    max-width: 992px;
    background-color: white;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    border: 1px solid #bababa;
    border-radius: 0.5em;
    padding: 0;
    margin: 0;
`

const Heading = styled.h1`
    width: calc(100% - 1.6em);
    padding: 0.8em;
    color: #000;
    font-weight: bold;
    font-size: 1.2em;
    border-bottom: 1px solid #bababa;
    margin: 0;
`

const Body = styled.div`
    flex: 1;
    width: 100%;
    overflow-y: scroll;
    display: grid;

    @media(max-width: 768px){
        grid-template-columns: 100%;
    }

    @media(min-width: 768px){
        grid-template-columns: 50% 50%;
    }
`

const InnerBody = styled.div`
    width: calc(100% - 2em);
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    padding: 1em;
`

const DualField = styled.div`
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
`

const ActionContainer = styled.div`
    width: calc(100% - 1.6em);
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    border-top: 1px solid #bababa;
    padding: 0.8em;
`

const ImageSelectContainer = styled.div`
    width: calc(100% - 1em);
    background-color: #e3e3e3;
    border: 3px dashed #bababa;
    padding: 0.5em;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    cursor: pointer;
    border-radius: 0.5em;

    span {
        display: flex;
        flex-direction: column;
        align-items: center;
    }
`

const ImageContainer = styled.div`
    width: 100%;
    height: 150px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    overflow-x: auto;
    overflow-y: hidden;
    margin-top: 1em;
`

const ImageWrapper = styled.div`
    width: 150px;
    height: 100%;
    margin-right: 0.5em;
    position: relative;
`

const Image = styled.img`
    width: 150px;
    height: 100%;
    object-fit: fill;
    background-color: white;
`

const ImageLoading = styled.div`
    min-width: 150px;
    height: 100%;
    background-color: #efefef;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 0.5em;
    position: relative;
`

export default AddItemDialog
