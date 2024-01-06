import styles from "./GenericList.module.css";

import { useGetExampleListQuery } from "@/api/api";

type Character = {
  name: string;
  birth_year: string | number;
}

export const GenericList = () => {
  const { data, isLoading, isError } = useGetExampleListQuery({
    limit: 10,
    offset: 0,
  });

  console.log(data);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Oh no, there was an error</div>;

  return (
    <div>
      <h1>Generic List</h1>
      <ul className={styles.list}>
        {data.results?.map((item: Character) => (
          <li key={item.name}>
            <h5> Name: {item.name} </h5>
            <h5> Birth Year: {item.birth_year} </h5>
          </li>
        ))}
      </ul>
    </div>
  );
};
