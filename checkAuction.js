const { Good, Auction, User, sequelize } = require('./models');
const { Op } = require('sequelize');

module.exports = async () => {
  try {
    const targets = await Good.findAll({ where: { soldId: null } });
    targets.forEach(async (target) => {
      const end = new Date(target.createdAt);
      end.setHours(end.getHours() + target.time);
      if (new Date() > end) {
        const success = await Auction.findOne({
          where: { goodId: target.id },
          order: [['bid', 'DESC']],
        });
        if (!success) {
          target.destroy();
        } else {
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
      }
    });
  } catch (error) {
    console.error(error);
  }
};
