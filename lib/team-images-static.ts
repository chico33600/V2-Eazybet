export interface TeamImageData {
  badge: string;
  banner?: string;
  stadium?: string;
}

export const TEAM_IMAGES: { [key: string]: TeamImageData } = {
  // Ligue 1 (France)
  'PSG': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/xr7oqz1473502346.png',
    banner: 'https://www.thesportsdb.com/images/media/team/banner/rsyuyu1420811750.jpg',
    stadium: 'https://www.thesportsdb.com/images/media/team/stadium/pxvpuv1420813256.jpg'
  },
  'Paris Saint Germain': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/xr7oqz1473502346.png',
    banner: 'https://www.thesportsdb.com/images/media/team/banner/rsyuyu1420811750.jpg',
    stadium: 'https://www.thesportsdb.com/images/media/team/stadium/pxvpuv1420813256.jpg'
  },
  'Marseille': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/xqrvrs1421431957.png',
    banner: 'https://www.thesportsdb.com/images/media/team/banner/qtpwuw1421432029.jpg',
    stadium: 'https://www.thesportsdb.com/images/media/team/stadium/txvvsu1420813677.jpg'
  },
  'Lyon': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/uqysqx1448811996.png',
    banner: 'https://www.thesportsdb.com/images/media/team/banner/vyrxyq1420811897.jpg',
    stadium: 'https://www.thesportsdb.com/images/media/team/stadium/rqqppp1420813692.jpg'
  },
  'Monaco': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/sswwyx1421432268.png',
    banner: 'https://www.thesportsdb.com/images/media/team/banner/tqusqr1421432297.jpg',
    stadium: 'https://www.thesportsdb.com/images/media/team/stadium/yypxuu1420813712.jpg'
  },
  'Lille': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/wsxuyp1448813175.png',
    banner: 'https://www.thesportsdb.com/images/media/team/banner/tpxtqw1421432099.jpg',
  },
  'Nice': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/uvrvyu1448813264.png',
    banner: 'https://www.thesportsdb.com/images/media/team/banner/qwxxqr1421432153.jpg',
  },
  'Rennes': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/qxqyst1420813256.png',
    banner: 'https://www.thesportsdb.com/images/media/team/banner/tvtxsu1421432216.jpg',
  },
  'Lens': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/srwuqq1421432169.png',
    banner: 'https://www.thesportsdb.com/images/media/team/banner/tyvwuu1421432183.jpg',
  },
  'Brest': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/yqtpus1421432013.png',
  },
  'Nantes': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/vttqqs1421432137.png',
  },
  'Strasbourg': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/xvqyrx1421432239.png',
  },
  'Reims': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/yquwst1421432199.png',
  },
  'Montpellier': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/xtvtpw1421432121.png',
  },
  'Le Havre': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/default.png',
  },
  'Auxerre': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/qwsvsu1448813043.png',
  },
  'Toulouse': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/wqqyuv1421432254.png',
  },
  'Angers': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/yxrwpw1421431942.png',
  },

  // Premier League (England)
  'Manchester United': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/xzqdr11517509072.png',
    banner: 'https://www.thesportsdb.com/images/media/team/banner/uxuuy31547301053.jpg',
    stadium: 'https://www.thesportsdb.com/images/media/team/stadium/qwxyyw1473504021.jpg'
  },
  'Manchester City': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/vwpvry1467462651.png',
    banner: 'https://www.thesportsdb.com/images/media/team/banner/tyqyuq1473502111.jpg',
    stadium: 'https://www.thesportsdb.com/images/media/team/stadium/qtyxqp1420823534.jpg'
  },
  'Liverpool': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/uvxuuq1448813372.png',
    banner: 'https://www.thesportsdb.com/images/media/team/banner/qwywxt1448813383.jpg',
    stadium: 'https://www.thesportsdb.com/images/media/team/stadium/tpqsuv1420813677.jpg'
  },
  'Chelsea': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/yvwvvr1448813304.png',
    banner: 'https://www.thesportsdb.com/images/media/team/banner/ywytuq1448813315.jpg',
    stadium: 'https://www.thesportsdb.com/images/media/team/stadium/vtqpxw1420813702.jpg'
  },
  'Arsenal': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/vrtrtp1448813175.png',
    banner: 'https://www.thesportsdb.com/images/media/team/banner/vxwrwy1448813196.jpg',
    stadium: 'https://www.thesportsdb.com/images/media/team/stadium/uvxwxr1420813256.jpg'
  },
  'Tottenham': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/tr2iqj1519407162.png',
    banner: 'https://www.thesportsdb.com/images/media/team/banner/xyvysu1448813455.jpg',
    stadium: 'https://www.thesportsdb.com/images/media/team/stadium/svyqps1420813702.jpg'
  },
  'Tottenham Hotspur': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/tr2iqj1519407162.png',
    banner: 'https://www.thesportsdb.com/images/media/team/banner/xyvysu1448813455.jpg',
    stadium: 'https://www.thesportsdb.com/images/media/team/stadium/svyqps1420813702.jpg'
  },
  'Newcastle United': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/c62gk51656669294.png',
    banner: 'https://www.thesportsdb.com/images/media/team/banner/tvsvws1448813403.jpg',
  },
  'Aston Villa': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/uuxxrs1448813214.png',
    banner: 'https://www.thesportsdb.com/images/media/team/banner/txwxvw1448813241.jpg',
  },
  'Brighton': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/k82t541665237636.png',
  },
  'West Ham': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/a2u98b1513005104.png',
    banner: 'https://www.thesportsdb.com/images/media/team/banner/znyozq1484247057.jpg',
  },
  'Everton': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/vwtuxt1448813348.png',
    banner: 'https://www.thesportsdb.com/images/media/team/banner/usrppw1448813362.jpg',
  },
  'Leicester City': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/a40zd51655715472.png',
  },
  'Fulham': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/zqp53j1665493257.png',
  },
  'Brentford': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/7yw30c1624271778.png',
  },
  'Crystal Palace': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/xtxqvt1448813289.png',
  },
  'Nottingham Forest': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/h8dx8b1659966619.png',
  },
  'Wolves': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/8wcdt51667820685.png',
  },
  'Bournemouth': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/3bd2p01659966641.png',
  },
  'Southampton': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/9g8vvk1665236691.png',
  },
  'Ipswich Town': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/default.png',
  },

  // La Liga (Spain)
  'Real Madrid': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/vwpvry1448813175.png',
    banner: 'https://www.thesportsdb.com/images/media/team/banner/qtwwrw1448813230.jpg',
    stadium: 'https://www.thesportsdb.com/images/media/team/stadium/qrpyuw1420813677.jpg'
  },
  'Barcelona': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/txrwth1517506314.png',
    banner: 'https://www.thesportsdb.com/images/media/team/banner/yxswqx1421435181.jpg',
    stadium: 'https://www.thesportsdb.com/images/media/team/stadium/ywpqrq1420813677.jpg'
  },
  'Atletico Madrid': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/vqusyy1448813175.png',
    banner: 'https://www.thesportsdb.com/images/media/team/banner/tqppyx1421434921.jpg',
    stadium: 'https://www.thesportsdb.com/images/media/team/stadium/qswrst1420813692.jpg'
  },
  'Sevilla': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/srqqxw1473502289.png',
    banner: 'https://www.thesportsdb.com/images/media/team/banner/yxtwvs1421435079.jpg',
  },
  'Valencia': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/qxyvup1421435132.png',
    banner: 'https://www.thesportsdb.com/images/media/team/banner/wvvwry1421435143.jpg',
  },
  'Real Sociedad': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/vrqwsv1421435037.png',
    banner: 'https://www.thesportsdb.com/images/media/team/banner/yvwsrt1421435048.jpg',
  },
  'Real Betis': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/svpqpq1421434991.png',
    banner: 'https://www.thesportsdb.com/images/media/team/banner/qqtsrt1421435011.jpg',
  },
  'Villarreal': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/urvxqw1421435155.png',
    banner: 'https://www.thesportsdb.com/images/media/team/banner/rrstur1421435166.jpg',
  },
  'Athletic Bilbao': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/txqsyp1421434946.png',
  },
  'Girona': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/default.png',
  },
  'Osasuna': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/qrtuvu1421434975.png',
  },
  'Getafe': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/wqyusr1421434954.png',
  },
  'Rayo Vallecano': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/svswup1421435026.png',
  },
  'Celta Vigo': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/yxtvxy1420813256.png',
  },
  'Mallorca': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/default.png',
  },
  'Las Palmas': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/default.png',
  },
  'Alaves': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/default.png',
  },
  'Espanyol': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/qysxxx1421434935.png',
  },
  'Leganes': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/default.png',
  },
  'Valladolid': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/default.png',
  },

  // Serie A (Italy)
  'Juventus': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/qsppuv1448813353.png',
    banner: 'https://www.thesportsdb.com/images/media/team/banner/xyxxtw1448813369.jpg',
    stadium: 'https://www.thesportsdb.com/images/media/team/stadium/rwrpvt1420813692.jpg'
  },
  'AC Milan': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/xqwpup1448813175.png',
    banner: 'https://www.thesportsdb.com/images/media/team/banner/sypssu1421354490.jpg',
    stadium: 'https://www.thesportsdb.com/images/media/team/stadium/rqsuwu1420813677.jpg'
  },
  'Inter Milan': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/txyxqt1448813304.png',
    banner: 'https://www.thesportsdb.com/images/media/team/banner/stvwtq1448813330.jpg',
    stadium: 'https://www.thesportsdb.com/images/media/team/stadium/xrvuwu1420813677.jpg'
  },
  'Inter': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/txyxqt1448813304.png',
    banner: 'https://www.thesportsdb.com/images/media/team/banner/stvwtq1448813330.jpg',
    stadium: 'https://www.thesportsdb.com/images/media/team/stadium/xrvuwu1420813677.jpg'
  },
  'Roma': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/rswxwq1473502989.png',
    banner: 'https://www.thesportsdb.com/images/media/team/banner/qvuqsw1421354572.jpg',
  },
  'Napoli': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/sxqrpq1421354509.png',
    banner: 'https://www.thesportsdb.com/images/media/team/banner/txvyqx1421354521.jpg',
  },
  'Lazio': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/vwsqsw1448813344.png',
    banner: 'https://www.thesportsdb.com/images/media/team/banner/suuxuu1421354479.jpg',
  },
  'Atalanta': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/trstrr1421354424.png',
    banner: 'https://www.thesportsdb.com/images/media/team/banner/rswxtr1421354436.jpg',
  },
  'Fiorentina': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/sqstpt1421354461.png',
    banner: 'https://www.thesportsdb.com/images/media/team/banner/wvwxpt1421354472.jpg',
  },
  'Torino': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/vuxqtu1421354611.png',
  },
  'Bologna': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/ssytxu1421354442.png',
  },
  'Udinese': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/qxwurt1421354626.png',
  },
  'Sassuolo': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/qxryus1421354587.png',
  },
  'Monza': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/default.png',
  },
  'Verona': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/default.png',
  },
  'Cagliari': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/default.png',
  },
  'Empoli': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/default.png',
  },
  'Lecce': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/default.png',
  },
  'Parma': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/trrvxr1421354536.png',
  },
  'Como': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/default.png',
  },
  'Venezia': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/default.png',
  },

  // Bundesliga (Germany)
  'Bayern Munich': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/uxwwqv1448813304.png',
    banner: 'https://www.thesportsdb.com/images/media/team/banner/xwqyxt1448813330.jpg',
    stadium: 'https://www.thesportsdb.com/images/media/team/stadium/sqwtqv1420813692.jpg'
  },
  'Bayern': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/uxwwqv1448813304.png',
    banner: 'https://www.thesportsdb.com/images/media/team/banner/xwqyxt1448813330.jpg',
    stadium: 'https://www.thesportsdb.com/images/media/team/stadium/sqwtqv1420813692.jpg'
  },
  'Borussia Dortmund': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/xqqppv1448813175.png',
    banner: 'https://www.thesportsdb.com/images/media/team/banner/wxxsus1448813196.jpg',
    stadium: 'https://www.thesportsdb.com/images/media/team/stadium/uqxuyv1420813692.jpg'
  },
  'Dortmund': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/xqqppv1448813175.png',
    banner: 'https://www.thesportsdb.com/images/media/team/banner/wxxsus1448813196.jpg',
    stadium: 'https://www.thesportsdb.com/images/media/team/stadium/uqxuyv1420813692.jpg'
  },
  'RB Leipzig': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/default.png',
  },
  'Bayer Leverkusen': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/vrspqx1448813276.png',
    banner: 'https://www.thesportsdb.com/images/media/team/banner/tstyqs1448813289.jpg',
  },
  'Leverkusen': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/vrspqx1448813276.png',
    banner: 'https://www.thesportsdb.com/images/media/team/banner/tstyqs1448813289.jpg',
  },
  'Eintracht Frankfurt': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/default.png',
  },
  'Frankfurt': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/default.png',
  },
  'Borussia Monchengladbach': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/default.png',
  },
  'Wolfsburg': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/tqvpxs1420813256.png',
  },
  'Union Berlin': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/default.png',
  },
  'Freiburg': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/default.png',
  },
  'Stuttgart': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/default.png',
  },
  'Hoffenheim': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/default.png',
  },
  'Mainz 05': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/default.png',
  },
  'Werder Bremen': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/default.png',
  },
  'Augsburg': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/default.png',
  },
  'Heidenheim': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/default.png',
  },
  'St Pauli': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/default.png',
  },
  'Holstein Kiel': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/default.png',
  },
  'Bochum': {
    badge: 'https://www.thesportsdb.com/images/media/team/badge/default.png',
  },
};

export function getTeamImages(teamName: string): TeamImageData | null {
  const normalizedName = teamName.trim();

  if (TEAM_IMAGES[normalizedName]) {
    return TEAM_IMAGES[normalizedName];
  }

  const lowerName = normalizedName.toLowerCase();
  for (const [key, value] of Object.entries(TEAM_IMAGES)) {
    if (key.toLowerCase().includes(lowerName) || lowerName.includes(key.toLowerCase())) {
      return value;
    }
  }

  return null;
}
