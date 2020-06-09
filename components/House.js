import Link from 'next/link'

const House = ({
  id,
  picture,
  type,
  town,
  title,
  rating,
  reviewsCount,
}) => (
  <Link href='/houses[id]' as={`/houses/${id}`}>
    <a>
      <img src={picture} width='100%' alt='House picture' />
      <p>
        {type} - {town}
      </p>
      <p>{title}</p>
    </a>
  </Link>
)

export default House

