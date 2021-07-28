import { Checkbox, TableCell, TableRow, Tooltip, Button } from "@material-ui/core"
import styled from 'styled-components'
import * as Icons from '@material-ui/icons'

function InventoryItem(props){

    const GetPrice = () => {
        if(props.data.gstIncluded)
            return props.data.price
        else
            return Math.round(((100.0 + props.data.gstPercent) / 100.0) * props.data.price)
    }

    const IsStockLow = () => {
        if(props.data.lowStockWarning){
            return props.data.stock < props.data.lowStockWarning
        }

        return false
    }

    return(
        <TableRow className="TableRow">
            <TableCell className="NormalCell">
                <Checkbox
                    checked={props.selectedItems.includes(props.data.docId)}
                    onChange={ev => props.onItemSelectChange(ev.target.checked)}
                    color="primary"
                    />
            </TableCell>
            <TableCell className="NormalCell">{props.data.name}</TableCell>
            <TableCell className="NormalCell">{props.data.code}</TableCell>
            <TableCell className="NormalCell">{props.data.category}</TableCell>
            <TableCell className="NormalCell">{props.data.stock}</TableCell>
            <TableCell className="NormalCell">₹ {props.data.stock * GetPrice()}</TableCell>
            <TableCell className="NormalCell">₹ {GetPrice()}</TableCell>
            <TableCell className="NormalCell">
                <ActionContainer>
                    {IsStockLow() && 
                    <Tooltip title="Low Stock" placement="top">
                        <Icons.Warning
                            color="secondary"
                            />
                    </Tooltip>}

                    <Button
                        style={{marginLeft: "1em"}}
                        variant="text"
                        color="default"
                        onClick={props.onEditClicked}
                        >
                        <Icons.Edit
                            color="default"
                            />
                    </Button>
                    <Button
                        style={{marginLeft: "1em"}}
                        variant="outlined"
                        color="primary"
                        onClick={props.onAdjustClicked}
                        >
                        ADJUST STOCK
                    </Button>
                </ActionContainer>
            </TableCell>
        </TableRow>
    )
}

const ActionContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
`

export default InventoryItem
