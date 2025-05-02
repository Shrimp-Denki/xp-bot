module.exports = {
    // Role-level multipliers (RoleID → multiplier)
    levelMultipliers: {
      '1367170246359777431':  1.0,
      '1364467920511701045':  1.2,
      '1364467921933307915':  1.5,
      '1364467923422412911':  2.0,
      '1364467925494403143':  2.5,
      '1364467927222325308':  2.5,
      '1364467928887722085':  3.0,
      '1364467930758385714':  3.0,
      '1364467932544897056':  3.0,
    },
  
    // Channel multipliers (ChannelID → multiplier)
    channelMultipliers: {
      '1364486333560651876': 3.0,
      '1363034359975903383': 1.5,
      '1363034339696312371': 3.0,
      '1363034341852315698': 3.0,
      '1363034343454413083': 3.0,
      '1363034345694302209': 3.0,
      '1363034347552247818': 3.0,
      '1363034347552247818': 3.0,
      '1363034351616659478': 3.0,
      // …v.v.
    },
  
    baseMessageXP: 10,   // XP gốc mỗi tin nhắ

    inviteXP: 20,
    // Bonus actions
    bonusActions: {
      share_material:   20,
      voice_10min:      30,
      weekly_challenge: 50,
      // …
    },
  
    // Thưởng 1 lần khi lên cấp
    levelUpBonuses: {
      15:  100,
      30:  200,
      50:  300,
      100: 500,
    },
  
    // Kênh log XP (chạy embed thông báo)
    logChannelId: '1367170939283832903'
  };
  