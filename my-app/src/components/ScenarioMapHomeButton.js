import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

const CustomButton = (props) => {
    const { center, zoom, sessionID } = props;
    const map = useMap();

    const createButtonControl = () => {
        const Homebutton = L.Control.extend({
            onAdd: () => {
                const button = L.DomUtil.create("button", "");
                button.innerHTML = "<i class='fa fa-home'></i>";

                button.addEventListener("click", () => {
                    map.setView(center, zoom)
                });

                return button;
            }
        });

        return new Homebutton({ position: "bottomleft" });
    }

    useEffect(() => {
        const control = createButtonControl();
        map.addControl(control)

    }, [sessionID]);
}



export default CustomButton;
