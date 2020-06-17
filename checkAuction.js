const { Good, Auction, User, sequelize } = require('./models');
const { Op } = require('sequelize');
const schedule = require('node-schedule');

module.exports = async () => {
  try {
    const targets = await Good.findAll({ where: { soldId: null } });
    targets.forEach(async (target) => {
      const end = new Date(target.createdAt);
      end.setHours(end.getHours() + target.time);
      if (new Date() > end) {
        // 경매가 종료된 경우
        const success = await Auction.findOne({
          where: { goodId: target.id },
          order: [['bid', 'DESC']],
        });
        if (!success) {
          // 입찰 기록이 없는 경우 삭제
          target.destroy();
        } else {
          // 입찰 기록이 있는 경우 db 업데이트
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
      } else {
        // 스케줄러 재시작
        schedule.scheduleJob(end, async () => {
          const success = await Auction.findOne({
            where: { goodId: target.id },
            order: [['bid', 'DESC']],
          });
          if (!success) {
            await good.destroy();
          } else {
            await Good.update({ soldId: success.userId }, { where: { id: target.id } });
            await User.update(
              { money: sequelize.literal(`money - ${success.bid}`) },
              { where: { id: success.userId } }
            );
          }
        });
      }
    });
  } catch (error) {
    console.error(error);
  }
};
