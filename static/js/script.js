function selectCell(cell) {
    console.log("cell number" + cell.toString());
    // pass the cell number to Python
    axios.post(`/quantum`, {
        params: {
            cell,
        }
    }, {
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(res => {

    })
    .catch(err => console.error(err));
}


