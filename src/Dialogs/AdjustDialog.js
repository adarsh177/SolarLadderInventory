import { Backdrop, Button, FormControl, FormControlLabel, FormLabel, Input, InputAdornment, InputLabel, MenuItem, Modal, Radio, RadioGroup, Select, Switch, TextField } from "@material-ui/core"
import * as Icons from '@material-ui/icons'
import { useState } from "react"
import styled from 'styled-components'
import { AdjustStock } from "../Database/Database"


function AdjustDialog(props){
    const [addStock, setAddStock] = useState(true)
    const [changeStockCount, setChangeStockCount] = useState(0)

    const GetFinalStock = () => {
        var changeStock = parseInt(changeStockCount)
        if(isNaN(changeStock)) changeStock = 0

        const finalStock = props.item.stock + (changeStock * (addStock ? 1 : -1))
        return Math.max(finalStock, 0)
    }

    const CloseDialog = () => {
        setAddStock(true)
        setChangeStockCount(0)
        props.onClose()
    }

    const SaveClicked = () => {
        AdjustStock(props.item.docId, GetFinalStock()).then(() => {
            CloseDialog()
        })
    }

    return(
        <Backdrop
            style={{zIndex: 1000}}
            open={props.open}
            onClose={props.onClose}>
                <MainContainer>
                    <Heading>Adjust Stock Quantity</Heading>
                    
                    <Body>
                        <p><b>Item Name: </b> {props.item.name}</p>
                        <p><b>Current Stock: </b> {props.item.stock} {props.item.unit}</p>

                        <FormControl component="fieldset" style={{marginTop: "0.5em"}}>
                            <FormLabel component="legend">Add or reduce Stock</FormLabel>
                            <RadioGroup 
                                row 
                                aria-label="addorremove" 
                                name="addorremove" 
                                value={addStock ? "add": "remove"}
                                onChange={ev => setAddStock(ev.target.value === "add")}>
                                <FormControlLabel value="add" control={<Radio color="primary" />} label="Add (+)" />
                                <FormControlLabel value="remove" control={<Radio color="primary" />} label="Remove (-)" />
                            </RadioGroup>
                        </FormControl>
                        <br />

                        <TextField
                            style={{width: "100%"}}
                            label="Adjust Stock" 
                            InputProps={{
                                endAdornment: <InputAdornment position="end">{props.item.unit}</InputAdornment>,
                            }}
                            inputMode="numeric"
                            variant="outlined"
                            value={changeStockCount}
                            onChange={ev => setChangeStockCount(ev.target.value)}/>

                        <br />
                        
                        <p><b>Final Stock: </b> {GetFinalStock()} {props.item.unit}</p>
                    </Body>

                    <ActionContainer>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={SaveClicked}>
                                SAVE
                        </Button>
                        <Button
                            style={{marginLeft: "0.8em"}}
                            variant="outlined"
                            color="secondary"
                            onClick={CloseDialog}>
                                DISCARD
                        </Button>
                    </ActionContainer>
                </MainContainer>
        </Backdrop>
    )
}

const MainContainer = styled.div`
    width: calc(100% - 1em);
    margin: 0 1em;
    max-height: 90%;
    max-width: 480px;
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
    width: calc(100% - 1.6em);
    overflow-y: scroll;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    padding: 0.8em;

    p{
        margin: 0.5em 0;
    }
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
export default AdjustDialog
