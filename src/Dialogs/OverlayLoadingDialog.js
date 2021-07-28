import { Backdrop, CircularProgress } from "@material-ui/core"


function OverlayLoadingDialog(props){

    return(
        <Backdrop
            style={{zIndex: 20, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", color: "#fff"}}
            open={props.open}>
            
            <CircularProgress size="3em" color="inherit"/>
            <br />
            <h2 style={{color: "#fff"}}>{props.text}</h2>
        </Backdrop>       
    )
}

export default OverlayLoadingDialog
