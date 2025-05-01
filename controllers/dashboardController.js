const { User } = require('../models');

const countPenjual = async (req, res) => {
  try {
    const count = await User.count({
      where: {
        role: 'penjual',
      },
    });
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ error: 'Gagal menghitung penjual', detail: error.message });
  }
};
const countPembeli = async (req, res) => {
    try {
      const count = await User.count({
        where: {
          role: 'pembeli',
        },
      });
      res.status(200).json({ count });
    } catch (error) {
      res.status(500).json({ error: 'Gagal menghitung penjual', detail: error.message });
    }
  };

module.exports = {
  countPenjual,
  countPembeli
};
