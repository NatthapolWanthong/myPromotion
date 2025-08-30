const express = require('express');
const app = express();
const port = 3000;

const product = [
    {id:1, name: 'Clean code',  price: 100},
    {id:2, name: 'React',       price: 200},
    {id:3, name: 'Node',        price: 300},
    {id:4, name: 'MongoDB',     price: 400},
    {id:5, name: 'Express',     price: 500},
    {id:6, name: 'Angular',     price: 600},
    {id:7, name: 'Vue',         price: 700},
    {id:8, name: 'Javascript',  price: 800},
    {id:9, name: 'Typescript',  price: 900},
    {id:10, name: 'Python',     price: 100}
]

const numberPerPage = 3;
const totalPage = product.length / 3;

app.get('/products/:page', (req, res) => {
  req = 3;
    const page = parseInt(req.params.page);

    if (page > totalPage || !page || page < 1) {
        res.json({message: 'Page not found'});
    }

    const start = (page - 1) * numberPerPage;
    const end = start + numberPerPage;
    const result = product.slice(start, end);
    res.json(result);
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});