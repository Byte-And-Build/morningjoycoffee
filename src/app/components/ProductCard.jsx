import styles from "../../app/page.module.css";
import { FaThumbsUp } from "react-icons/fa";
import Image from "next/image";
import { useRouter } from "next/navigation";

const ProductCard = ({filteredItems}) => {

    const router = useRouter();

    const BASE_INGREDIENTS = [
    "16oz Disposable Coffee Cup With Lid and Sleeves", 
    "20oz Disposable Coffee Cup With Lid and Sleeves",
    "32oz Clear Plastic Cup With Lid and Straw"
    ];

return (
        <>
        {filteredItems?.map((item, index) => (
            <div key={index} className={styles.drinkWrapper} onClick={() => router.push(`/item/${item._id}`)}>
              <div className={styles.ratingContainerHome}>
                <span className={styles.ratingText}>{item.rating?.thumbsUp || 0}</span>
                <FaThumbsUp size={'1.5rem'} className={styles.ratingText} />
              </div>
              {item && (
              <Image src={item.image ? item.image : Placeholder} alt={item.name} width={150} height={150}  className="item-image" loading="lazy" />
              )}
              <h3 className={styles.drinkName}>{item.name}</h3>
              <ul style={{display:'flex', flexWrap:'wrap', flexDirection: 'row', width:'100%', height:'33%', overflowY:'auto', overflowX:'hidden', padding:'.5rem', gap:'.5rem', boxShadow:'var(--insetShadow)', borderRadius:'var(--borderRadiusSmall)', alignContent:'flex-start'}}>
                {item.sizes?.[0]?.ingredients
                  ?.filter((ing) => 
                    ing && 
                    !BASE_INGREDIENTS.includes(ing.name) &&
                    ing.quantity > 0
                  )
                  .map((ing, i) => (
                    <span key={i} style={{color:'var(--fontColor)', flex: "1", minWidth: "100%", fontSize: ".8rem", borderBottom: "1px dashed var(--fontColor)"}}>
                      +{ing.name}
                    </span>
                ))}

              </ul>
            </div>
          ))}
        </> 
    );
}
 
export default ProductCard;