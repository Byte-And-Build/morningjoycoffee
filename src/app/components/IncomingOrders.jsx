import styles from "../../app/page.module.css";
import Image from "next/image";

const IncomingOrders = () => {
    return ( 
        <div className={styles.orderWrapper}>
            <Image src={order.Img}/>
            <div className={styles.horizContainer}>
                {order.ingrediants}
            </div>
            <div className={styles.horizContainer}>
                {order.status}
            </div>
            <div className={styles.horizContainer}>
                <label class="switch">
                <input type="checkbox"/>
                <span class="slider round"></span>
                </label>
            </div>
        </div>
     );
}
 
export default IncomingOrders;