import {
  AspectRatio,
  Box,
  Flex,
  Image,
  List,
  ListIcon,
  Text,
  ListItem,
  HStack,
  Center,
  Button,
  Icon,
} from "@chakra-ui/react";
import React, { Suspense } from "react";
import { useState } from "react";
import { useContextMenu } from "react-contexify";
import { FaPlay } from "react-icons/fa";
import { FiExternalLink } from "react-icons/fi";
import { IoMdPlay } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";
import useNamePicker from "../../modules/common/useNamePicker";
import { useStoreActions, useStoreState } from "../../store";
import { useDraggableSong } from "../data/DraggableSong";
import { SongTable } from "../data/SongTable";
import { DEFAULT_MENU_ID } from "./CommonContext";
import { MotionBox } from "./MotionBox";
import { NowPlayingIcon } from "./NowPlayingIcon";
import { QueryStatus } from "./QueryStatus";

export const VideoPlaylistCard = React.memo(
  ({ video, playlist }: { video: any; playlist?: PlaylistFull }) => {
    const setPlaylist = useStoreActions(
      (actions) => actions.playback.setPlaylist
    );
    const currentlyPlayingId = useStoreState(
      (state) => state.playback.currentlyPlaying.song?.id
    );
    const navigate = useNavigate();

    function openVideo() {
      if (playlist?.content) setPlaylist({ playlist });
      else window.open(`https://holodex.net/watch/${video.id}`, "_blank");
    }
    const tn = useNamePicker();

    return (
      <Box width="100%" height="100%">
        <AspectRatio
          ratio={34 / 9}
          maxH="auto"
          borderRadius="lg"
          borderColor="brand.100"
          borderWidth="2px"
          borderStyle="solid"
          overflow="hidden"
          boxSizing="border-box"
        >
          <Flex>
            <AspectRatio
              ratio={16 / 9}
              flex={"0 1"}
              flexBasis={1600 / 34 + "%"}
              width={1600 / 34 + "%"}
            >
              <div>
                <MotionBox
                  position="absolute"
                  width="100%"
                  height="100%"
                  display="flex"
                  top="0"
                  justifyContent="center"
                  alignItems="center"
                  whileHover={{
                    backgroundColor: "rgba(0,0,0,0.4)",
                    opacity: 1,
                  }}
                  opacity={0}
                  transition={{
                    duration: 0.3,
                  }}
                  onClick={openVideo}
                  cursor="pointer"
                >
                  <MotionBox
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    // onClick={() => playSong()}
                  >
                    <Icon
                      as={playlist?.content ? FaPlay : FiExternalLink}
                      w={8}
                      h={8}
                      color="brand.50"
                      textShadow="2xl"
                    />
                  </MotionBox>
                </MotionBox>

                <Image
                  src={`https://i.ytimg.com/vi/${video.id}/sddefault.jpg`}
                  borderRadius="md"
                />
              </div>
            </AspectRatio>
            <Box
              flex={"1 1"}
              flexBasis={900 / 34 + "%"}
              height="100%"
              bgColor="bgAlpha.800"
              overflowY="scroll"
            >
              {playlist?.content ? (
                <Suspense
                  fallback={<QueryStatus queryStatus={{ isLoading: true }} />}
                >
                  <SongTable
                    songs={playlist.content}
                    rowProps={{
                      hideCol: ["og_artist", "duration", "sang_on", "menu"],
                      flipNames: true,
                      songClicked: (e, song) =>
                        setPlaylist({
                          playlist,
                          startPos: playlist.content?.findIndex(
                            (s) => s.id === song.id
                          ),
                        }),
                    }}
                  />
                </Suspense>
              ) : (
                <Center height="100%">
                  {new Date(video.available_at) < new Date() ? (
                    <Box>
                      <Text>Stream is not yet tagged with any songs.</Text>
                      <Button
                        variant="link"
                        colorScheme={"n2"}
                        as="a"
                        href={`https://holodex.net/edit/video/${video.id}/music`}
                        target="_blank"
                      >
                        Help us tag it on Holodex
                      </Button>
                    </Box>
                  ) : (
                    <Box>
                      <Text>Going Live (distance)</Text>
                      <Button variant="link" colorScheme={"n2"}>
                        Watch on Holodex
                      </Button>{" "}
                      <Button variant="link" colorScheme={"n2"}>
                        (Youtube)
                      </Button>
                    </Box>
                  )}
                </Center>
              )}
            </Box>
          </Flex>
        </AspectRatio>
        <Text
          mt={1}
          as={Link}
          display="block"
          to={`/video/${video.id}`}
          _hover={{ color: "whiteAlpha.700" }}
        >
          {video.title}
        </Text>
        <Text
          opacity={0.75}
          fontSize="sm"
          display="block"
          as={Link}
          to={`/channel/${video.channel_id || video.channel.id}`}
          _hover={{ color: "whiteAlpha.700" }}
        >
          {tn(video.channel.english_name, video.channel.name)}
        </Text>
      </Box>
    );
  }
);

const HighlightListItem = React.memo(
  ({
    song,
    songClicked,
    index = 0,
    active,
  }: {
    song: Song;
    songClicked: () => void;
    index: number;
    active: boolean;
  }) => {
    const dragProps = useDraggableSong(song);
    const [hover, setHover] = useState(false);
    const { show } = useContextMenu({ id: DEFAULT_MENU_ID });

    function LeftIcon() {
      if (active)
        return (
          <NowPlayingIcon style={{ color: "var(--chakra-colors-n2-400)" }} />
        );
      if (hover)
        return (
          <MotionBox
            whileHover={{
              scale: 1.2,
              transition: { duration: 0.3, type: "tween", ease: "easeOut" },
            }}
            whileTap={{ scale: 0.8 }}
          >
            <ListIcon as={IoMdPlay} width="20px" mr={0} color="n2.300" />
          </MotionBox>
        );
      return <Text width="20px">{index + 1}.</Text>;
    }
    return (
      <ListItem
        key={song.id + "highlightsong"}
        scrollSnapAlign="start"
        _hover={{ bgColor: "whiteAlpha.200", cursor: "pointer" }}
        bgColor={active ? "whiteAlpha.200" : ""}
        transition="0.3s"
        pl={2}
        onClick={songClicked}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        {...dragProps}
        onContextMenu={(e) => show(e, { props: song })}
      >
        <HStack>
          <LeftIcon />
          <Box>
            <Text noOfLines={0}>{song.name}</Text>
            <Text noOfLines={0} color="gray.500" fontSize="sm">
              {song.original_artist}
            </Text>
          </Box>
        </HStack>
      </ListItem>
    );
  }
);
