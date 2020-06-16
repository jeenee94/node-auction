const { Good, Auction, User, sequelize } = require('./models');
const { Op } = require('sequelize');

module.exports = async () => {
  try {
    const prev = new Date();
    prev.setMinutes(prev.getMinutes() - 3 + 9 * 60);
    const targets = await Good.findAll({
      where: {
        soldId: null,
        createdAt: { [Op.lte]: prev },
      },
    });
    targets.forEach(async (target) => {
      const success = await Auction.findOne({
        where: { goodId: target.id },
        order: [['bid', 'DESC']],
      });
      if (!success) target.destroy();
      else {
        await Good.update({ soldId: success.userId }, { where: { id: target.id } });
        await User.update(
          {
            money: sequelize.literal(`money - ${success.bid}`),
          },
          {
            where: { id: success.userId },
          }
        );
      }
    });
  } catch (error) {
    console.error(error);
  }
};
