const Card = require('../models/Card');

exports.addCard = async (req, res) => {
    const { title, description, tags } = req.body;
    try {
        const card = new Card({
            title,
            description,
            tags,
            user: req.user._id,
        });
        await card.save();
        res.status(201).json(card);
    } catch (error) {
        res.status(400).json({ message: 'Failed to add card', error });
    }
};

exports.getCards = async (req, res) => {
    try {
        const cards = await Card.find().populate('user', 'name');
        res.json(cards);
    } catch (error) {
        res.status(400).json({ message: 'Failed to fetch cards', error });
    }
};

exports.getCardById = async (req, res) => {
    try {
        const card = await Card.findById(req.params.id).populate('user', 'name email');
        if (!card) return res.status(404).json({ message: 'Card not found' });
        res.json(card);
    } catch (error) {
        res.status(400).json({ message: 'Failed to fetch card details', error });
    }
};