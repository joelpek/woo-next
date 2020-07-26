import Link from "next/link";

const ParentCategoryBlock = (props) => {
  const { category } = props;
  console.log(category);

  return (
    <div className="col-lg-6 col-md-12 col-sm-12 pcb">
      {category.name === "Uncategorized" ? (
        ""
      ) : (
        <Link
          as={`/category/${category.slug}-${category.id}`}
          href={`/category?slug=${category.slug}-${category.id}`}
        >
          <a>
            <h3 className="card-header-category text-center">{category.name}</h3>
            <img
              className="link-image"
              src={null !== category.image ? category.image.sourceUrl : ""}
              alt="ParentCategoryBlock image"
            />
          </a>
        </Link>
      )}
    </div>
  );
};

export default ParentCategoryBlock;
