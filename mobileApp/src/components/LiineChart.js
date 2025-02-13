import React from 'react';
import { View, Text } from 'react-native';
import { LineChart } from 'react-native-chart-kit';


const Liinechart = (props) => {
  return (
    <LineChart
      data={props.data}
      
      width={props.width}
      height={props.height}
      verticalLabelRotation={30}
      chartConfig={{
        backgroundGradientFrom: props.backgroundGradient,
        backgroundGradientFromOpacity: 0,                    //Opacity = 0 rồi thật ra ko cần truyền màu cũng được, mờ 100% - cái chart sẽ màu cái chứa nó.
        backgroundGradientTo: props.backgroundGradient,   // Nền cũng để màu chạy tuyến tính đc nma t thấy ko thích nên để 1 cái màu thôi.
        backgroundGradientToOpacity: 0,
        color: (opacity = 1) => props.colorLine,
        labelColor: (opacity = 1) => `rgb(0, 0, 0)`,
        strokeWidth: 4, // optional, default 3
        barPercentage: 0.5,
        useShadowColorFromDataset: false, // optional
        fillShadowGradientFrom: props.fillShadowGradientFrom,
        fillShadowGradientFromOpacity: props.Opacity,
        fillShadowGradientTo: props.fillShadowGradientTo,
        fillShadowGradientToOpacity: props.Opacity,
      }}
      bezier={true}
      withInnerLines={false}
      withOuterLines={false}
      style={{
      //  marginStart: 15,
      }}
    />
  )
}
export default Liinechart