import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import { FormControl, Tooltip, Button, TableContainer, Paper, TableHead, TableRow, TableBody, TableCell, Table, Checkbox } from '@material-ui/core'
import { Pagination } from '@material-ui/lab'
import * as Icons from '@material-ui/icons'
import './InventoryScreen.css'
import AddItemDialog from '../Dialogs/AddItemDialog'
import { DeleteInventoryItem, GetConfig, GetInventory } from '../Database/Database'
import InventoryItem from '../Components/InventoryItem'
import AdjustDialog from '../Dialogs/AdjustDialog'
import OverlayLoadingDialog from '../Dialogs/OverlayLoadingDialog'
import NoResultImage from '../Assets/no_result.png'

const ITEMS_PER_PAGE = 10;

function InventoryScreen(props){
    const [categoryFilter, setCategoryFilter] = useState('All')
    const [items, setItems] = useState([])
    const [finalItemList, setFinalItemList] = useState([])
    const [selectedItemArray, setSelectedItemArray] = useState([]) // contains Id of selected Items
    // Adjust dialog variables
    const [showAdjustDialog, setShowAdjustDialog] = useState(false)
    const [adjustItem, setAdjustItem] = useState({})
    // config data - categories and units
    const [categories, setCategories] = useState([])
    const [units, setUnits] = useState([])
    const [gstValues, setGstValues] = useState([])
    // add/edit inventory variables
    const [showAddItemDialog, setShowAddItemDialog] = useState(false)
    const [editItemSelect, setEditItemSelect] = useState(null)
    // loading
    const [loadingText, setLoadingText] = useState(null)
    // filters
    const [showLowStocks, setShowLowStocks] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)

    const AdjustClicked = (item) => {
        setAdjustItem(item)
        setShowAdjustDialog(true)
    }

    const EditItem = (item) => {
        setEditItemSelect(item)
        setShowAddItemDialog(true)
    }

    const DeleteItems = async () => {
        const confirm = window.confirm('Are you sure?')
        if(!confirm) return

        setLoadingText('Deleting Item(s)')
        await Promise.all(selectedItemArray.map(async item => {
            return await DeleteInventoryItem(item)
        }))
        setLoadingText(null)
        setSelectedItemArray([])

        LoadInventory()
    }

    const ItemSelected = (docId, selected) => {
        const filteredList = selectedItemArray.filter(item => item !== docId)
        if(selected)
            setSelectedItemArray([...filteredList, docId])
        else
            setSelectedItemArray(filteredList)
    }

    const SelectAll = (select) => {
        if(select)
            setSelectedItemArray(items.map(item => item.docId))
        else
            setSelectedItemArray([])
    }

    const LoadInventory = () => {
        setLoadingText('Refreshing Inventory')
        GetInventory().then(val => {
            console.log('Item', val)
            setItems(val)
        }).finally(() => setLoadingText(null))
    }

    const FilterInventory = () => {
        let filteredList = items
        if(showLowStocks){
            filteredList = filteredList.filter(item => {
                if(item.lowStockWarning === null)
                    return false
                return item.stock < item.lowStockWarning
            })
        }

        if(categoryFilter !== 'All'){
            filteredList = filteredList.filter(item => {
                return item.category === categoryFilter
            })
        }

        // resetting pages
        setCurrentPage(1)

        setFinalItemList(filteredList)
    }

    const LoadConfig = () => {
        GetConfig().then(val => {
            console.log('CNU', val)
            setCategories(val.Category)
            setUnits(val.QuantityUnits)
            setGstValues(val.GST)
        })
    }

    useEffect(() => {
        LoadInventory()
        LoadConfig()
    }, [])

    useEffect(() => {
        FilterInventory()
    }, [items, showLowStocks, categoryFilter])

    return(
        <MainContainer>
            <Navigation>
                <NavLogo src="./solar_ladder.png" />
            </Navigation>

            <InventoryHeadingSpan>
                <Icons.Store fontSize="small" htmlColor="#2595be" />
                <InventoryHeading>Inventory</InventoryHeading>
            </InventoryHeadingSpan>

            <MenuContainer>
                <Button
                    className="MenuMobileFix"
                    variant={showLowStocks ? "outlined" : "text"}
                    color={showLowStocks ? "secondary": "primary"}
                    onClick={() => setShowLowStocks(!showLowStocks)}
                    endIcon={showLowStocks && <Icons.Close />}
                    >
                        SHOW LOW STOCKS
                </Button>
                <FormControl className="MenuMobileFix" style={{minWidth: "150px", marginLeft: "1.5em"}}>
                    <Select
                        value={categoryFilter}
                        onChange={ev => setCategoryFilter(ev.target.value)}
                        >
                        <MenuItem value="All">All</MenuItem>
                        {categories.map(item => {
                            return(
                                <MenuItem value={item}>{item}</MenuItem>
                            )
                        })}
                    </Select>
                </FormControl>
                <Button
                    className="MenuMobileFix"
                    style={{marginLeft: "1.5em"}}
                    variant="contained"
                    color="secondary"
                    disabled={selectedItemArray.length === 0}
                    onClick={() => DeleteItems()}
                    startIcon={<Icons.Delete />}
                    >
                        DELETE SELECTED
                </Button>
                <Button
                    className="MenuMobileFix"
                    style={{marginLeft: "1.5em"}}
                    variant="contained"
                    color="primary"
                    displayEmpty
                    startIcon={<Icons.Add />}
                    onClick={() => {
                        setEditItemSelect(null)
                        setShowAddItemDialog(true)
                    }}
                    >
                        ADD TO INVENTORY
                </Button>
                <Button
                    className="MenuMobileFix"
                    style={{marginLeft: "1.5em"}}
                    variant="outlined"
                    color="primary"
                    displayEmpty
                    onClick={LoadInventory}
                    >
                        <Icons.Refresh fontSize="medium" />
                </Button>
            </MenuContainer>

            <TableContainer component={Paper}>
                <Table style={{minWidth: "992px"}}>
                    <TableHead>
                        <TableRow>
                            <TableCell className="BoldCell">
                                <Checkbox
                                    color="primary"
                                    checked={selectedItemArray.length === items.length  && items.length > 0}
                                    onChange={ev => SelectAll(ev.target.checked)}
                                 />
                            </TableCell>
                            <TableCell className="BoldCell">Item Name</TableCell>
                            <TableCell className="BoldCell">Item Code</TableCell>
                            <TableCell className="BoldCell">Category</TableCell>
                            <TableCell className="BoldCell">Stock Quantity</TableCell>
                            <TableCell className="BoldCell">Stock Value</TableCell>
                            <TableCell className="BoldCell">Purchase Price</TableCell>
                            <TableCell className="BoldCell"></TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {finalItemList.slice((currentPage - 1) * ITEMS_PER_PAGE, Math.min(currentPage * ITEMS_PER_PAGE, finalItemList.length)).map(item => {
                            return(
                                <InventoryItem
                                    data={item}
                                    onAdjustClicked={() => AdjustClicked(item)}
                                    selectedItems={selectedItemArray}
                                    onEditClicked={() => EditItem(item)}
                                    onItemSelectChange={(selected) => ItemSelected(item.docId, selected)}/>
                            )
                        })}
                    </TableBody>
                </Table>
            </TableContainer>

            {finalItemList.length === 0 && 
            <>
                <NoResult src={NoResultImage} />
                <NoResultText>
                    Your Inventory is empty!
                </NoResultText>
            </>}

            <Pagination 
                className="Pagination" 
                count={Math.ceil(finalItemList.length / ITEMS_PER_PAGE)}
                page={currentPage}
                onChange={(ev, val) => setCurrentPage(val)}/>
        
            <br />
            <p>Created by <a target="_blank" href="https://adarshshrivastava.in">Adarsh Shrivastava</a></p>

            <AdjustDialog 
                open={showAdjustDialog}
                item={adjustItem}
                onClose={() => {
                    setShowAdjustDialog(false)
                    LoadInventory()
                }} />

            <AddItemDialog
                open={showAddItemDialog}
                editItem={editItemSelect}
                units={units}
                categories={categories}
                gst={gstValues}
                onClose={() => {
                    setShowAddItemDialog(false)
                    LoadInventory()
                }} />
            
            <OverlayLoadingDialog open={loadingText !== null} text={loadingText} />
        </MainContainer>
    );
}

const MainContainer = styled.div`
    width: calc(100% - 4em);
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    padding: 2em;
    background-color: var(--secondaryColor);
`

const Navigation = styled.nav`
    width: 100%;
    /* max-width: 992px; */
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
`

const NavLogo = styled.img`
    height: 2em;
    width: auto;
    object-fit: contain;
`

const InventoryHeadingSpan = styled.span`
    width: 100%;
    /* max-width: 992px; */
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-top: 1em;
    border-bottom: 1px solid #d1d1d1;
    margin-bottom: 1em;
`

const InventoryHeading = styled.h1`
    color: var(--primaryColor);
    display: inline-block;
    font-size: 1.2em;
    vertical-align: middle;
    margin-left: 0.2em;
`

const MenuContainer = styled.div`
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    flex-wrap: wrap;
    margin-bottom: 1em;
`

const ActionContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
`

const NoResult = styled.img`
    max-height: 200px;
    object-fit: contain;
    margin-top: 2em;
`

const NoResultText = styled.h2`
    font-size: 1.4em;
    font-weight: bold;
    color: var(--primaryColor);
    text-align: center;
`

export default InventoryScreen
