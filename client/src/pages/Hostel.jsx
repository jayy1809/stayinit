import React, { useEffect, useState } from "react";
import {
  useParams,
  useSearchParams,
  Link,
  useNavigate,
  useLoaderData,
  useRevalidator,
} from "react-router-dom";

import { Spinner } from "@material-tailwind/react";
import { useAuth } from "../contexts/Auth";
import { nanoid } from "nanoid";

import Pricing from "../components/Hostel/Pricing";
import AminitesText from "../components/Hostel/AminitiesText";
import ImageCarousel from "../components/ImageCarousel";
import CommentsDiv from "../components/CommentsDiv";
import NearestLandmarks from "../components/NearestLandmarks";
import { toast } from "react-toastify";

function useFetch(commentsLength) {
  try {
    const params = useParams();
    const { hostelname } = params;

    const [hostel, setHostel] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    async function init(hostelname) {
      setLoading(true);
      const requestOptions = {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      };

      const response = await fetch(
        `http://localhost:5000/api/v1/hostel/${hostelname}`,
        requestOptions
      );
      const jsonResponse = await response.json();

      if (jsonResponse.success === true) {
        setHostel(jsonResponse.data);
        setLoading(false);
      } else {
        setError(jsonResponse.message);
        toast.error(jsonResponse.message);
        throw new Error(jsonResponse.message);
      }
    }

    useEffect(() => {
      init(hostelname);
    }, [params, commentsLength]);

    return { hostel, loading, error };
  } catch (error) {
    toast.error(error.message);
    throw new Error(error.message);
  }
}

export default function HostelInfo() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [commentsLength, setCommentsLength] = useState(0);
  const { hostel, loading, error } = useFetch(commentsLength);

  const {
    _id,
    name,
    priceAndSharing,
    forWhichGender,
    addressLink,
    address,
    locality,
    city,
    pincode,
    contactNumber,
    contactEmail,
    addedBy,
    nearestLandmarks,
    nearestLandmarksForSearching,
    comments,
    likes,
    arrayOfImages,
    description,
    liftFacility,
    wifiFacility,
    gymFacility,
    acFacility,
    gamingRoom,
    freeLaundry,
    securityGuard,
    filterWater,
    cctv,
    cleaning,
  } = hostel;

  // Creating Aminities Div
  const aminitesArr = [];

  if (acFacility === true) {
    aminitesArr.push(<AminitesText url={"ac.png"} name={"Air Conditioner"} />);
  }
  if (liftFacility === true) {
    aminitesArr.push(<AminitesText url={"lift.png"} name={"Lift Avilable"} />);
  }
  if (wifiFacility === true) {
    aminitesArr.push(<AminitesText url={"wifi.png"} name={"Free Wifi"} />);
  }
  if (gymFacility === true) {
    aminitesArr.push(<AminitesText url={"gym.png"} name={"Gym Facility"} />);
  }
  if (freeLaundry === true) {
    aminitesArr.push(
      <AminitesText url={"laundry.png"} name={"Free Laundry"} />
    );
  }
  if (cctv === true) {
    aminitesArr.push(<AminitesText url={"cctv.png"} name={"CCTV"} />);
  }
  if (cleaning === true) {
    aminitesArr.push(
      <AminitesText url={"cleaning.png"} name={"Room Cleaning"} />
    );
  }
  if (securityGuard === true) {
    aminitesArr.push(
      <AminitesText url={"security.png"} name={"Security Guard"} />
    );
  }
  if (filterWater === true) {
    aminitesArr.push(<AminitesText url={"water.png"} name={"Water Filter"} />);
  }

  // Creating Pricing And Sharing Div
  const priceAndSharingDivArray = Array.isArray(priceAndSharing)
    ? priceAndSharing.map((x) => {
        return <Pricing key={nanoid()} price={x.price} sharing={x.sharing} />;
      })
    : [];

  const { authData } = useAuth();
  const { isAuthenticate, profile } = authData;

  const [likedProperty, setLikedProperty] = useState([]);
  const [likesLength, setLikesLength] = useState(() => likedProperty.length);
  const [likeLoading, setLikeLoading] = useState(false);

  async function getLikes() {
    try {
      const requestOptions = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      };

      const response = await fetch(
        `http://localhost:5000/api/v1/likes`,
        requestOptions
      );
      const jsonResponse = await response.json();
      const data = jsonResponse.data;

      if (jsonResponse.success === true) {
        const newList = [];
        data.forEach((like) => {
          like.hostel ? newList.push(like.hostel._id) : null;
        });

        setLikedProperty(newList);
      } else {
        toast.error(jsonResponse.message);
      }
    } catch (error) {
      toast.error(error.message);
      throw new Error(error.message);
    }
  }

  React.useEffect(() => {
    if (isAuthenticate) {
      setLikeLoading(true);
      getLikes();
      setLikeLoading(false);
    }
  }, [likesLength, isAuthenticate]);

  function toggleLike() {
    if (isAuthenticate) {
      if (likedProperty.includes(hostel._id)) {
        unlike();
      } else {
        like();
      }
    }
  }

  async function unlike() {
    try {
      if (isAuthenticate) {
        const responseOptions = {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        };

        setLikeLoading(true);
        const response = await fetch(
          `http://localhost:5000/api/v1/likes/hostel/${hostel._id}`,
          responseOptions
        );
        const jsonResponse = await response.json();
        setLikeLoading(false);

        if (jsonResponse.success === true) {
          toast.success(jsonResponse.message);
          setLikedProperty(() => {
            return likedProperty.filter((property) => {
              return property !== hostel._id;
            });
          });

          setLikesLength((prev) => {
            return prev - 1;
          });
        } else {
          toast.error(jsonResponse.message);
        }
      }
    } catch (error) {
      toast.error(error.message);
      throw new Error(error.message);
    }
  }

  async function like() {
    try {
      if (isAuthenticate) {
        const bodyData = {
          propertyId: hostel._id,
          type: "hostel",
        };

        const requestObject = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(bodyData),
        };

        setLikeLoading(true);
        const response = await fetch(
          `http://localhost:5000/api/v1/likes`,
          requestObject
        );
        const jsonResponse = await response.json();
        setLikeLoading(false);

        if (jsonResponse.success === true) {
          toast.success(jsonResponse.message);
          setLikedProperty((prev) => {
            const newList = [...prev];
            newList.push(hostel._id);
            return newList;
          });

          setLikesLength((prev) => {
            return prev + 1;
          });
        } else {
          toast.error(jsonResponse.message);
        }
      }
    } catch (error) {
      toast.error(error.message);
      throw new Error(error.message);
    }
  }

  if (!loading) {
    return (
      <div className="mt-4 gap-8  p-8 flex flex-col">
        <div className="relative">
          {/* Like icon */}
          {isAuthenticate ? (
            <div className="w-[3.5rem] h-[3.5rem] bg-colorY border-2 border-[#073937] p-2 rounded-lg z-[5] absolute top-8 right-8 flex justify-center items-center">
              {likeLoading ? (
                <Spinner color="red" size="lg" className="w-full h-full" />
              ) : (
                <img
                  src={
                    likedProperty.includes(hostel._id)
                      ? `/icons/red-heart.png`
                      : `/icons/heart.png`
                  }
                  className="w-full h-full"
                  onClick={toggleLike}
                  alt=""
                />
              )}
            </div>
          ) : null}

          <ImageCarousel arrayOfImages={arrayOfImages} />
        </div>

        <div className="md-down: justify-items-center  grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-colorY cursor-pointer rounded-[1rem] border shadow-sm border-[#F3EADC] p-6 flex flex-col items-start w-full h-auto relative gap-4 no-scrollbar overflow-x-hidden">
            <div className="flex flex-row flex-wrap gap-2 my-3 py-[0.5rem] px-10 w-full">
              {aminitesArr}
            </div>
          </div>

          {/* Pricing */}
          <div className=" cursor-pointer hover:bg-colorY2H rounded-[1rem] border shadow-sm border-[#F3EADC] p-6 flex flex-col items-start w-full h-auto  relative">
            <div className=" text-teal-950 text-xs leading-3 tracking-wide self-start whitespace-nowrap">
              <h3>
                <a href="" rel="noopener noreferrer" target="_blank">
                  ROOM BHK &amp; RENT
                </a>
              </h3>
            </div>
            <div className="flex-col items-start self-stretch flex w-full justify-between gap-5 mt-4">
              {priceAndSharingDivArray}
            </div>
          </div>

          {/* Contact Details */}
          <div className=" cursor-pointer hover:bg-colorY2H rounded-[1rem] border shadow-sm border-[#F3EADC] p-6 flex items-center flex-col w-full h-auto ">
            <div className="text-teal-950 text-xs leading-3 tracking-wide self-start whitespace-nowrap">
              <h3>
                <a href="" rel="noopener noreferrer" target="_blank">
                  Contact Details
                </a>
              </h3>
            </div>
            <div className="items-start self-stretch flex w-full justify-between gap-5 mt-4">
              <div className="text-teal-950 text-l leading-5 tracking-normal self-stretch">
                Contact Number
              </div>
              <div className="text-teal-950 text-l font-bold leading-5 tracking-normal self-stretch whitespace-nowrap">
                <span className="font-bold">{contactNumber}</span>
              </div>
            </div>
            <div className="items-start self-stretch flex w-full justify-between gap-5 mt-4">
              <div className="text-teal-950 text-l leading-5 tracking-normal self-stretch">
                Mail
              </div>
              <div className="text-teal-950 text-l font-bold leading-5 tracking-normal self-stretch whitespace-nowrap">
                <span className="font-bold">{contactEmail}</span>
              </div>
            </div>
            <div className="items-start self-stretch flex w-full justify-between gap-5 mt-4">
              <div className="text-teal-950 text-l leading-5 tracking-normal self-stretch">
                Address
              </div>
              <div className="text-teal-950 text-l font-bold leading-5 tracking-normal self-stretch whitespace-nowrap">
                <span className="font-bold">{address}</span>
              </div>
            </div>
            <div className="items-start self-stretch flex w-full justify-between gap-5 mt-4">
              <div className="text-teal-950 text-l leading-5 tracking-normal self-stretch">
                Location URL
              </div>
              <div className="text-teal-950 text-l font-bold leading-5 tracking-normal self-stretch whitespace-nowrap">
                <a href={addressLink} className="font-bold">
                  View On GoogleMap
                </a>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="cursor-pointer hover:bg-colorY2H p-6  flex rounded-[1rem] border shadow-sm border-[#F3EADC] flex-col w-full h-auto ">
            <div className="text-teal-950 text-xs leading-3 tracking-wide self-start whitespace-nowrap">
              <h3>
                <a href="" target="_blank">
                  Description
                </a>
              </h3>
            </div>
            <p className="py-2 my-2">{description}</p>
          </div>

          {/* Nearest Landmarks */}
          <NearestLandmarks
            nearestLandmarksForSearching={nearestLandmarksForSearching}
          />

          <div>MAPS</div>

          {/* Comments */}
          <div className="w-full">
            <CommentsDiv
              key={_id}
              type="hostel"
              _id={_id}
              comments={comments}
              setCommentsLength={setCommentsLength}
            />
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner color="green" className="h-16 w-16" />
      </div>
    );
  }
}
