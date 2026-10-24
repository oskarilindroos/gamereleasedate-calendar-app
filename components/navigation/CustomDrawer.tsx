import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import * as Styled from "../styled/styles";

export default function CustomDrawer(props: DrawerContentComponentProps) {
  return (
    <Styled.DrawerContainer>
      <DrawerContentScrollView {...props}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>
    </Styled.DrawerContainer>
  );
}
